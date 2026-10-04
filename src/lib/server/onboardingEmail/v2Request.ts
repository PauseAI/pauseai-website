import { url as siteUrl, verificationParameter } from '$lib/config.js'
import { CHAPTER_LINK_LABELS, webLink } from './chapter.js'
import { resolveOnboardingEmailLanguage } from './language.js'
import { stripMarkdown } from './markdown.js'
import type {
	BaseLanguage,
	ChapterLink,
	OnboardingEmailV2Params,
	OnboardingRouting
} from './types.js'

// Validates a v2 render request (docs/onboarding-email-v2-contract.md). Every rule here is part
// of that contract: change the doc with it.

export const CONTRACT_VERSION = 2

export type V2RequestError = { code: 'unsupported_version' | 'invalid_request'; message: string }

type Parsed = { ok: true; params: OnboardingEmailV2Params } | { ok: false; error: V2RequestError }

const TOP_LEVEL_FIELDS = new Set([
	'version',
	'first_name',
	'language',
	'country',
	'intent',
	'keep_informed',
	'routing',
	'verification_link'
])
const CHAPTER_FIELDS = new Set(['kind', 'chapter_id', 'name', 'country', 'links'])
const SUPPORTED_LANGUAGES: readonly BaseLanguage[] = ['en', 'es']
const MAX_TEXT = 200
const MAX_LINKS = CHAPTER_LINK_LABELS.length
const MAX_URL = 2048
const RECORD_ID = /^rec[A-Za-z0-9]{14}$/
const TOKEN = /^[A-Za-z0-9._~-]{1,512}$/

class InvalidRequest extends Error {}

function invalid(field: string, problem: string): never {
	throw new InvalidRequest(`"${field}" ${problem}`)
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function rejectUnknown(body: Record<string, unknown>, allowed: Set<string>, prefix = ''): void {
	const unknown = Object.keys(body).find((key) => !allowed.has(key))
	if (unknown !== undefined) invalid(`${prefix}${unknown}`, 'is not a field of this version')
}

function requiredText(value: unknown, field: string): string {
	if (typeof value !== 'string' || value.trim() === '') invalid(field, 'must be a non-empty string')
	if (value.length > MAX_TEXT) invalid(field, `must be at most ${MAX_TEXT} characters`)
	return value.trim()
}

function optionalText(value: unknown, field: string): string | undefined {
	if (value === undefined || value === null || value === '') return undefined
	return requiredText(value, field)
}

/** A language tag such as `es`, `es-MX` or `es_ES` names Spanish. One the shared copy is not
 *  written in falls back to English; none at all falls back to the country, as v1 does. */
function resolveLanguage(language: string | undefined, country: string | undefined): BaseLanguage {
	if (language === undefined) return resolveOnboardingEmailLanguage(country, undefined)
	const primary = language.toLowerCase().split(/[-_]/)[0]
	return SUPPORTED_LANGUAGES.find((supported) => supported === primary) ?? 'en'
}

function parseLinks(value: unknown): ChapterLink[] {
	if (value === undefined || value === null) return []
	if (!Array.isArray(value)) invalid('routing.links', 'must be an array')
	if (value.length > MAX_LINKS) invalid('routing.links', `must have at most ${MAX_LINKS} entries`)
	return value.map((link: unknown, index) => {
		const field = `routing.links[${index}]`
		if (!isObject(link)) invalid(field, 'must be an object')
		rejectUnknown(link, new Set(['label', 'url']), `${field}.`)
		if (typeof link.label !== 'string' || !CHAPTER_LINK_LABELS.includes(link.label)) {
			invalid(`${field}.label`, `must be one of ${CHAPTER_LINK_LABELS.join(', ')}`)
		}
		if (typeof link.url !== 'string' || link.url.length > MAX_URL || !isHttpsUrl(link.url)) {
			invalid(`${field}.url`, 'must be an https URL')
		}
		return { label: link.label, url: webLink(link.url) }
	})
}

function isHttpsUrl(value: string): boolean {
	try {
		return new URL(value).protocol === 'https:' && !/\s/.test(value)
	} catch {
		return false
	}
}

function parseRouting(value: unknown): OnboardingRouting {
	if (!isObject(value)) invalid('routing', 'must be an object')
	if (value.kind === 'global') {
		rejectUnknown(value, new Set(['kind']), 'routing.')
		return { kind: 'global' }
	}
	if (value.kind !== 'chapter') invalid('routing.kind', 'must be "global" or "chapter"')
	rejectUnknown(value, CHAPTER_FIELDS, 'routing.')
	const chapterId = value.chapter_id
	if (typeof chapterId !== 'number' || !Number.isSafeInteger(chapterId) || chapterId <= 0) {
		invalid('routing.chapter_id', 'must be a positive integer')
	}
	return {
		kind: 'chapter',
		chapterId,
		name: stripMarkdown(requiredText(value.name, 'routing.name')),
		country: requiredText(value.country, 'routing.country'),
		links: parseLinks(value.links)
	}
}

/**
 * The link must be the site's own join verification link, written exactly as the URL parser
 * writes it back, so what is embedded is what was checked.
 */
function parseVerificationLink(value: unknown): string {
	const field = 'verification_link'
	if (typeof value !== 'string' || value.length > MAX_URL) invalid(field, 'must be a string')
	let link: URL
	try {
		link = new URL(value)
	} catch {
		invalid(field, 'must be an absolute URL')
	}
	if (link.href !== value) invalid(field, 'must be in canonical form')
	if (link.origin !== new URL(siteUrl).origin || link.pathname !== '/verify') {
		invalid(field, `must be ${siteUrl}/verify`)
	}
	if (link.username || link.password || link.hash)
		invalid(field, 'must have no credentials or fragment')
	const keys = [...link.searchParams.keys()]
	const allowed = new Set(['table', verificationParameter, 'token'])
	if (keys.some((key) => !allowed.has(key)) || new Set(keys).size !== keys.length) {
		invalid(field, `may carry only table, ${verificationParameter} and token, once each`)
	}
	if (link.searchParams.get('table') !== 'join') invalid(field, 'must have table=join')
	if (!RECORD_ID.test(link.searchParams.get(verificationParameter) ?? '')) {
		invalid(field, `must have a record id in ${verificationParameter}`)
	}
	const token = link.searchParams.get('token')
	if (token !== null && !TOKEN.test(token)) invalid(field, 'has a malformed token')
	return value
}

export function parseV2Request(body: unknown): Parsed {
	if (!isObject(body)) {
		return { ok: false, error: { code: 'invalid_request', message: 'Body must be a JSON object' } }
	}
	if (body.version !== CONTRACT_VERSION) {
		return {
			ok: false,
			error: { code: 'unsupported_version', message: `"version" must be ${CONTRACT_VERSION}` }
		}
	}
	try {
		rejectUnknown(body, TOP_LEVEL_FIELDS)
		const country = optionalText(body.country, 'country')
		if (
			body.keep_informed !== undefined &&
			body.keep_informed !== null &&
			typeof body.keep_informed !== 'boolean'
		) {
			invalid('keep_informed', 'must be a boolean or null')
		}
		return {
			ok: true,
			params: {
				firstName: requiredText(body.first_name, 'first_name'),
				language: resolveLanguage(optionalText(body.language, 'language'), country),
				intent: optionalText(body.intent, 'intent'),
				keepInformed: typeof body.keep_informed === 'boolean' ? body.keep_informed : undefined,
				routing: parseRouting(body.routing),
				verificationLink: parseVerificationLink(body.verification_link)
			}
		}
	} catch (error) {
		if (error instanceof InvalidRequest) {
			return { ok: false, error: { code: 'invalid_request', message: error.message } }
		}
		throw error
	}
}
