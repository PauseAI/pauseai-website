// cspell:ignore mailersend airtable

// Loads the pre-migration MailerSend templates (raw payload dumps in
// /email-templates/*.json) so the dev-only compare page can show one directly next
// to the new repo-rendered email for the equivalent signup. Routing for the live
// automation lives in airtable-mailersend-emails.js and ROUTING.md; here each
// template is instead picked by hand from a dropdown, paired with the
// country/language/intent combo it used to be sent for.

import type { OnboardingEmailLanguage } from './types.js'

type RawTemplate = {
	id: string
	name: string
	source_code: string
	plain_text: string
	settings: { email_subject: string }
}

// import.meta.glob keeps these out of TS module resolution (the files live at repo
// root, outside src/) while Vite still bundles them for the server build. The value
// shape is `{ data: RawTemplate }` — the raw MailerSend API response.
const TEMPLATE_MODULES = import.meta.glob<{ data: RawTemplate }>('/email-templates/*.json', {
	eager: true,
	import: 'default'
})

function rawByFilePrefix(prefix: string): RawTemplate {
	const match = Object.entries(TEMPLATE_MODULES).find(([path]) =>
		path.replace('/email-templates/', '').startsWith(prefix)
	)
	if (!match) throw new Error(`Legacy template file "${prefix}*" not found in /email-templates`)
	return match[1].data
}

export type LegacyTemplateKey =
	| 'DEFAULT'
	| 'SPANISH'
	| 'UK'
	| 'CANADA_EN'
	| 'CANADA_FR'
	| 'NOT_VOLUNTEERING'
	| 'UK_NON_VOLUNTEERING'

type LegacyTemplateDef = {
	key: LegacyTemplateKey
	filePrefix: string
	/** The signup combo this template was sent for, per ROUTING.md. Feeds the
	 *  "closest" new render on the compare page; intent is the page default and
	 *  can be overridden there. */
	canonical: {
		country: string
		language: OnboardingEmailLanguage
		intent: string
	}
}

const DEFS: LegacyTemplateDef[] = [
	{
		key: 'DEFAULT',
		filePrefix: 'default-',
		canonical: { country: '', language: 'en', intent: 'Volunteer' }
	},
	{
		key: 'SPANISH',
		filePrefix: 'spanish-',
		canonical: { country: 'Spain', language: 'es', intent: 'Volunteer' }
	},
	{
		key: 'UK',
		filePrefix: 'uk-jy7zpl97',
		canonical: { country: 'United Kingdom', language: 'en', intent: 'Volunteer' }
	},
	{
		key: 'CANADA_EN',
		filePrefix: 'canada-en-',
		canonical: { country: 'Canada', language: 'en', intent: 'Volunteer' }
	},
	{
		key: 'CANADA_FR',
		filePrefix: 'canada-fr-',
		canonical: { country: 'Canada', language: 'fr', intent: 'Volunteer' }
	},
	{
		key: 'NOT_VOLUNTEERING',
		filePrefix: 'not-volunteering-',
		canonical: { country: '', language: 'en', intent: 'Keep informed' }
	},
	{
		key: 'UK_NON_VOLUNTEERING',
		filePrefix: 'uk-non-volunteering-',
		canonical: { country: 'United Kingdom', language: 'en', intent: 'Keep informed' }
	}
]

export type LegacyTemplateOption = {
	key: LegacyTemplateKey
	id: string
	name: string
	canonical: LegacyTemplateDef['canonical']
}

/** Dropdown source for the compare page: every pre-migration template, in routing
 *  order, with its MailerSend id/name and the combo it maps to. */
export const LEGACY_TEMPLATE_OPTIONS: LegacyTemplateOption[] = DEFS.map((def) => {
	const raw = rawByFilePrefix(def.filePrefix)
	return { key: def.key, id: raw.id, name: raw.name, canonical: def.canonical }
})

function byKey(key: LegacyTemplateKey): LegacyTemplateDef {
	const def = DEFS.find((d) => d.key === key)
	if (!def) throw new Error(`Unknown legacy template key: ${key}`)
	return def
}

export function isLegacyTemplateKey(value: string | null): value is LegacyTemplateKey {
	return DEFS.some((d) => d.key === value)
}

// The live script fills first_name + verification_link via MailerSend
// personalization; reproduce that so the preview isn't littered with {{...}}.
function fillPersonalization(input: string, firstName: string, verificationLink: string): string {
	return input
		.replace(/{{\s*first_name\s*}}/g, firstName)
		.replace(/{{\s*verification_link\s*}}/g, verificationLink)
}

export type LegacyTemplateRender = {
	key: LegacyTemplateKey
	id: string
	name: string
	canonical: LegacyTemplateDef['canonical']
	subject: string
	html: string
	text: string
}

export function renderLegacyTemplate(args: {
	key: LegacyTemplateKey
	firstName: string
	verificationLink: string
}): LegacyTemplateRender {
	const def = byKey(args.key)
	const raw = rawByFilePrefix(def.filePrefix)
	return {
		key: def.key,
		id: raw.id,
		name: raw.name,
		canonical: def.canonical,
		subject: fillPersonalization(raw.settings.email_subject, args.firstName, args.verificationLink),
		html: fillPersonalization(raw.source_code, args.firstName, args.verificationLink),
		text: fillPersonalization(raw.plain_text, args.firstName, args.verificationLink)
	}
}
