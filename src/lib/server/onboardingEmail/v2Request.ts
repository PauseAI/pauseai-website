import { COUNTRY_BY_ISO_CODE } from '$lib/server/countryCodes'
import { normaliseEmail } from '$lib/server/emailVerification'
import { resolveOnboardingEmailLanguage } from './language.js'
import { stripMarkdown } from './markdown.js'
import type { BaseLanguage, OnboardingEmailV2Params, OnboardingRouting } from './types.js'

// Validates a v2 render request (docs/onboarding-email-v2-contract.md). Every rule here is part
// of that contract: change the doc with it.

export const CONTRACT_VERSION = 2

export type V2RequestError = { code: 'unsupported_version' | 'invalid_request'; message: string }

type Parsed = { ok: true; params: OnboardingEmailV2Params } | { ok: false; error: V2RequestError }

const TOP_LEVEL_FIELDS = new Set([
	'version',
	'first_name',
	'language',
	'languages',
	'country',
	'country_code',
	'intent',
	'keep_informed',
	'routing',
	'record_id',
	'to_email'
])
// `links` is accepted and ignored: the website reads the chapter's links itself.
const CHAPTER_FIELDS = new Set(['kind', 'chapter_id', 'name', 'country', 'country_code', 'links'])
const SUPPORTED_LANGUAGES: readonly BaseLanguage[] = ['en', 'es']
const MAX_TEXT = 200
const MAX_LANGUAGES = 50
const RECORD_ID = /^rec[A-Za-z0-9]{14}$/
// One @ with something either side and no whitespace: enough to refuse a value that is not an
// address, without second-guessing the CRM's own validation.
const EMAIL = /^[^\s@]+@[^\s@]+$/
const MAX_EMAIL = 254

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
 *  written in falls back to English. */
function languageFromTag(language: string): BaseLanguage {
	const primary = language.toLowerCase().split(/[-_]/)[0]
	return SUPPORTED_LANGUAGES.find((supported) => supported === primary) ?? 'en'
}

function parseLanguages(value: unknown): string[] | undefined {
	if (value === undefined || value === null) return undefined
	if (!Array.isArray(value)) invalid('languages', 'must be an array of strings')
	if (value.length > MAX_LANGUAGES) {
		invalid('languages', `must have at most ${MAX_LANGUAGES} entries`)
	}
	return value.map((entry: unknown, index) => {
		if (typeof entry !== 'string') invalid(`languages[${index}]`, 'must be a string')
		if (entry.length > MAX_TEXT) {
			invalid(`languages[${index}]`, `must be at most ${MAX_TEXT} characters`)
		}
		return entry
	})
}

/** `languages`, when sent, decides with v1's resolver; otherwise `language`; otherwise the
 *  country, again as v1 decides it. */
function resolveLanguage(
	languages: string[] | undefined,
	language: string | undefined,
	country: string | undefined
): BaseLanguage {
	if (languages === undefined && language !== undefined) return languageFromTag(language)
	return resolveOnboardingEmailLanguage(country, languages)
}

const ISO_CODE = /^[A-Za-z]{2}$/

/** An ISO 3166-1 alpha-2 code, as the website spells that country; undefined for a code the
 *  table does not know. */
function countryFromCode(value: unknown, field: string): string | undefined {
	if (typeof value !== 'string' || !ISO_CODE.test(value.trim())) {
		invalid(field, 'must be an ISO 3166-1 alpha-2 code')
	}
	return COUNTRY_BY_ISO_CODE[value.trim().toUpperCase()]
}

const hasCountryCode = (body: Record<string, unknown>) =>
	body.country_code !== undefined && body.country_code !== null && body.country_code !== ''

/** `country_code` when sent, else the `country` name. */
function parseCountry(body: Record<string, unknown>, prefix = ''): string | undefined {
	return hasCountryCode(body)
		? countryFromCode(body.country_code, `${prefix}country_code`)
		: optionalText(body.country, `${prefix}country`)
}

// A chapter needs a country: it selects the chapter's own email and its National Groups row.
function routedCountry(routing: Record<string, unknown>): string {
	const country = parseCountry(routing, 'routing.')
	if (country !== undefined) return country
	if (hasCountryCode(routing))
		invalid('routing.country_code', 'is not a country code the website knows')
	return invalid('routing.country', 'must be a non-empty string')
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
		country: routedCountry(value)
	}
}

function parseRecordId(value: unknown): string {
	if (typeof value !== 'string' || !RECORD_ID.test(value)) {
		invalid('record_id', 'must be an Airtable record id (rec followed by 14 letters or digits)')
	}
	return value
}

function parseToEmail(value: unknown): string {
	if (typeof value !== 'string' || value.length > MAX_EMAIL || !EMAIL.test(normaliseEmail(value))) {
		invalid('to_email', 'must be an email address')
	}
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
		const country = parseCountry(body)
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
				language: resolveLanguage(
					parseLanguages(body.languages),
					optionalText(body.language, 'language'),
					country
				),
				intent: optionalText(body.intent, 'intent'),
				keepInformed: typeof body.keep_informed === 'boolean' ? body.keep_informed : undefined,
				routing: parseRouting(body.routing),
				recordId: parseRecordId(body.record_id),
				toEmail: parseToEmail(body.to_email)
			}
		}
	} catch (error) {
		if (error instanceof InvalidRequest) {
			return { ok: false, error: { code: 'invalid_request', message: error.message } }
		}
		throw error
	}
}
