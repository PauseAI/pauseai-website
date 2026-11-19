import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'
import {
	CONTACT_DEADLINE_MS,
	CONTACT_INBOXES,
	sendContactToCrm,
	type ContactRequest
} from '$lib/server/contactCrm'
import { checkNotSpam } from '$lib/server/turnstile-verify'
import { partnershipOptions } from './partnership-options'

export const prerender = false

/**
 * Maximum characters accepted per field. The client shows softer hints, but these
 * are the limits that count: bots POST straight to the action and never run our JS.
 */
const MAX_LENGTHS: Record<string, number> = {
	name: 100,
	email: 254,
	subject: 200,
	organization: 200,
	city_country: 200,
	message: 5000,
	details: 5000,
	other_partnership_type: 200
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getFormString(formData: FormData, field: string): string | undefined {
	const value = formData.get(field)
	return typeof value === 'string' ? value : undefined
}

function countWords(value: string): number {
	return value.trim().split(/\s+/).filter(Boolean).length
}

/** Returns an error message if any submitted field exceeds its cap. */
function findOversizedField(formData: FormData): string | undefined {
	for (const [field, max] of Object.entries(MAX_LENGTHS)) {
		const value = getFormString(formData, field)
		if (value && value.length > max) {
			return `The ${field.replace(/_/g, ' ')} field is too long (maximum ${max} characters).`
		}
	}
	return undefined
}

/** Sends the enquiry, answering a failure with the inbox to write to instead. */
async function send(
	request: ContactRequest,
	{ deadline, url, platform }: { deadline: number; url: URL; platform?: App.Platform }
) {
	const result = await sendContactToCrm(request, { deadline, hostname: url.hostname, platform })
	if (result === 'ok') return { success: true }
	const inbox = CONTACT_INBOXES[request.type]
	if (result === 'refused') {
		return fail(400, {
			message: `We couldn't accept your message as entered. Please check your details, or email us at ${inbox}.`
		})
	}
	return fail(503, {
		message: `Sorry, we couldn't send your message. Please email us at ${inbox} instead.`
	})
}

export const actions: Actions = {
	media: async ({ request, url, platform }) => {
		const deadline = Date.now() + CONTACT_DEADLINE_MS
		const data = await request.formData()

		const spam = await checkNotSpam(data, url.hostname)
		if (spam.drop) return { success: true }
		if (spam.message) return fail(403, { message: spam.message })

		const oversized = findOversizedField(data)
		if (oversized) return fail(400, { message: oversized })

		const name = getFormString(data, 'name')
		const email = getFormString(data, 'email')
		const subject = getFormString(data, 'subject')
		const organization = getFormString(data, 'organization')
		const details = getFormString(data, 'details')

		if (!name || !email || !subject || !organization || !details) {
			return fail(400, { message: 'Missing required fields' })
		}

		if (!EMAIL_PATTERN.test(email)) {
			return fail(400, { message: 'Please enter a valid email address.' })
		}

		return send(
			{ type: 'Media', name, email, subject, message: details, organization },
			{ deadline, url, platform }
		)
	},
	partnerships: async ({ request, url, platform }) => {
		const deadline = Date.now() + CONTACT_DEADLINE_MS
		const data = await request.formData()

		const spam = await checkNotSpam(data, url.hostname)
		if (spam.drop) return { success: true }
		if (spam.message) return fail(403, { message: spam.message })

		const oversized = findOversizedField(data)
		if (oversized) return fail(400, { message: oversized })

		const name = getFormString(data, 'name')
		const email = getFormString(data, 'email')
		const organization = getFormString(data, 'organization')
		const city_country = getFormString(data, 'city_country')
		const message = getFormString(data, 'message')

		// The form offers a fixed list, so anything else was not sent by our UI.
		const partnershipType = getFormString(data, 'partnership_type') ?? ''
		if (!partnershipOptions.includes(partnershipType)) {
			return fail(400, { message: 'Please choose how you would like to partner with us.' })
		}

		let subject = partnershipType
		if (partnershipType === 'Other') {
			const otherType = getFormString(data, 'other_partnership_type')
			if (!otherType) {
				return fail(400, { message: 'Please describe the type of partnership.' })
			}
			if (countWords(otherType) > 10) {
				return fail(400, { message: 'Other partnership type must be 10 words or less.' })
			}
			subject = `Other: ${otherType}`
		}

		if (!name || !email || !city_country || !message) {
			return fail(400, { message: 'Missing required fields' })
		}

		if (!EMAIL_PATTERN.test(email)) {
			return fail(400, { message: 'Please enter a valid email address.' })
		}

		const messageWords = countWords(message)
		if (messageWords > 200) {
			return fail(400, { message: `Message must be 200 words or less. (Sent: ${messageWords})` })
		}

		return send(
			{
				type: 'Partnerships',
				name,
				email,
				subject,
				message,
				organization: organization ?? '',
				city_country
			},
			{ deadline, url, platform }
		)
	},
	feedback: async ({ request, url, platform }) => {
		const deadline = Date.now() + CONTACT_DEADLINE_MS
		const data = await request.formData()

		const spam = await checkNotSpam(data, url.hostname)
		if (spam.drop) return { success: true }
		if (spam.message) return fail(403, { message: spam.message })

		const oversized = findOversizedField(data)
		if (oversized) return fail(400, { message: oversized })

		// Both optional: the CRM names a sender without a name "Anonymous".
		const name = getFormString(data, 'name') ?? ''
		const email = getFormString(data, 'email') ?? ''
		const subject = getFormString(data, 'subject')
		const message = getFormString(data, 'message')

		if (!subject || !message) {
			return fail(400, { message: 'Missing required fields' })
		}

		// Email is optional here, but must look real if given.
		if (email && !EMAIL_PATTERN.test(email)) {
			return fail(400, { message: 'Please enter a valid email address.' })
		}

		return send({ type: 'Feedback', name, email, subject, message }, { deadline, url, platform })
	}
}
