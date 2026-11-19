import { fail, type Action } from '@sveltejs/kit'
import type { Actions } from './$types'
import { CRM_REQUEST_DEADLINE_MS } from '$lib/server/crmIntake'
import {
	CONTACT_INBOXES,
	sendContactToCrm,
	type ContactRequest,
	type ContactType
} from '$lib/server/contactCrm'
import { checkNotSpam } from '$lib/server/turnstile-verify'
import { partnershipOptions } from './partnership-options'

export const prerender = false

/** Each free-text field, the most characters it takes, and what a message calls it. */
const FIELDS = {
	name: { max: 100, label: 'name' },
	email: { max: 254, label: 'email' },
	subject: { max: 200, label: 'subject' },
	organization: { max: 200, label: 'organization' },
	city_country: { max: 200, label: 'city and country' },
	other_partnership_type: { max: 200, label: 'partnership type' },
	message: { max: 5000, label: 'message' },
	details: { max: 5000, label: 'message' }
} as const

type Field = keyof typeof FIELDS

// The fields a message may break lines in. CiviCRM refuses any other control character, and
// any at all in the one-line fields, since those go into the email's headers.
const MULTILINE_FIELDS: ReadonlySet<Field> = new Set(['message', 'details'])
const CONTROL_CHARACTER = /\p{Cc}/u
const CONTROL_CHARACTER_IN_TEXT = /[^\P{Cc}\t\n]/u

// The CRM's addr-spec (ChapterMailConfig::parseAddrSpec): plain ASCII, dot-atom local part, and
// a domain of letters, digits and hyphens with a TLD of two or more letters.
const ADDR_SPEC =
	/^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/
const NON_ASCII = /\P{ASCII}/u

/**
 * The submitted text fields: one-line fields trimmed, a message's line breaks made `\n`, as
 * CiviCRM reads them. Missing fields are empty.
 */
type Form = Record<Field, string> & { partnership_type: string }

function readForm(data: FormData): Form {
	const text = (field: string) => {
		const value = data.get(field)
		return typeof value === 'string' ? value : ''
	}
	const form = { partnership_type: text('partnership_type') } as Form
	for (const field of Object.keys(FIELDS) as Field[]) {
		const value = text(field)
		form[field] = MULTILINE_FIELDS.has(field) ? value.replace(/\r\n?/g, '\n') : value.trim()
	}
	return form
}

/** The first field that is too long or holds a character CiviCRM refuses, as a message. */
function findBadField(form: Form): string | undefined {
	for (const field of Object.keys(FIELDS) as Field[]) {
		const { max, label } = FIELDS[field]
		const value = form[field]
		if (value.length > max) {
			return `The ${label} field is too long (maximum ${max} characters).`
		}
		if (MULTILINE_FIELDS.has(field)) {
			if (CONTROL_CHARACTER_IN_TEXT.test(value)) {
				return `The ${label} contains invisible control characters we can't send. Please remove them (line breaks and tabs are fine).`
			}
		} else if (CONTROL_CHARACTER.test(value)) {
			return `The ${label} field can't contain line breaks or invisible control characters.`
		}
	}
	return undefined
}

function findBadEmail(email: string, inbox: string): string | undefined {
	if (NON_ASCII.test(email)) {
		return `Please use a plain email address, without accents or non-Latin letters, or email us at ${inbox}.`
	}
	if (!ADDR_SPEC.test(email)) return 'Please enter a valid email address.'
	return undefined
}

function countWords(value: string): number {
	return value.trim().split(/\s+/).filter(Boolean).length
}

const MISSING = 'Missing required fields'

/**
 * One form's action: the checks every form shares, then `fields` (the form's own rules, which
 * answer an error message or what to send), then the CRM.
 */
function contactAction(
	type: ContactType,
	fields: (form: Form) => Omit<ContactRequest, 'type'> | string
): Action {
	const inbox = CONTACT_INBOXES[type]
	return async ({ request, url, platform }) => {
		const deadline = Date.now() + CRM_REQUEST_DEADLINE_MS
		const data = await request.formData()

		const spam = await checkNotSpam(data, url.hostname)
		if (spam.drop) return { success: true }
		if (spam.message) return fail(403, { message: spam.message })

		const form = readForm(data)
		const bad = findBadField(form)
		if (bad) return fail(400, { message: bad })

		const enquiry = fields(form)
		if (typeof enquiry === 'string') return fail(400, { message: enquiry })
		// Required by the forms that need one; optional feedback's must be valid if given.
		const badEmail = enquiry.email ? findBadEmail(enquiry.email, inbox) : undefined
		if (badEmail) return fail(400, { message: badEmail })

		const result = await sendContactToCrm(
			{ type, ...enquiry },
			{ deadline, hostname: url.hostname, platform }
		)
		if (result === 'ok') return { success: true }
		if (result === 'refused') {
			return fail(400, {
				message: `We couldn't accept your message as entered. Please check your details, or email us at ${inbox}.`
			})
		}
		return fail(503, {
			message: `Sorry, we couldn't send your message. Please email us at ${inbox} instead.`
		})
	}
}

export const actions: Actions = {
	media: contactAction('Media', ({ name, email, subject, organization, details }) => {
		if (!name || !email || !subject || !organization || !details.trim()) return MISSING
		return { name, email, subject, message: details, organization }
	}),
	partnerships: contactAction('Partnerships', (form) => {
		const { name, email, organization, city_country, message } = form
		// The form offers a fixed list, so anything else was not sent by our UI.
		if (!partnershipOptions.includes(form.partnership_type)) {
			return 'Please choose how you would like to partner with us.'
		}
		let subject = form.partnership_type
		if (subject === 'Other') {
			const otherType = form.other_partnership_type
			if (!otherType) return 'Please describe the type of partnership.'
			if (countWords(otherType) > 10) return 'Other partnership type must be 10 words or less.'
			subject = `Other: ${otherType}`
		}
		if (!name || !email || !city_country || !message.trim()) return MISSING
		const messageWords = countWords(message)
		if (messageWords > 200) return `Message must be 200 words or less. (Sent: ${messageWords})`
		return { name, email, subject, message, organization, city_country }
	}),
	// Name and email are optional: the CRM names a sender without a name "Anonymous".
	feedback: contactAction('Feedback', ({ name, email, subject, message }) => {
		if (!subject || !message.trim()) return MISSING
		return { name, email, subject, message }
	})
}
