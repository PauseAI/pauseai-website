import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'
import { dev } from '$app/environment'
import { env } from '$env/dynamic/private'
import { createRecord } from '$lib/airtable'
import { TURNSTILE_FIELD } from '$lib/turnstile'
import { partnershipOptions } from './partnership-options'

// Airtable configuration (User to fill in later)
const CONTACT_AIRTABLE_BASE_ID = 'appWPTGqZmUcs3NWu'
const CONTACT_AIRTABLE_TABLE_ID = 'tblPP2kM7uTheBrpw'

export const prerender = false

// Configure recipient email addresses for each contact form type
const CONTACT_RECIPIENTS = {
	Media: 'press@pauseai.info',
	Partnerships: 'partnerships@pauseai.info',
	Feedback: 'feedback@pauseai.info'
} as const

const mailerSendApiKey = env.MAILERSEND_API_KEY

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

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

type ContactFormType = keyof typeof CONTACT_RECIPIENTS

type MailerSendError = {
	message?: string
}

type TurnstileVerification = { success?: boolean; 'error-codes'?: unknown }

function getFormString(formData: FormData, field: string): string | undefined {
	const value = formData.get(field)
	return typeof value === 'string' ? value : undefined
}

function isMailerSendError(value: unknown): value is MailerSendError {
	return typeof value === 'object' && value !== null
}

function isTurnstileVerification(value: unknown): value is TurnstileVerification {
	return typeof value === 'object' && value !== null
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
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

/**
 * Verifies the Cloudflare Turnstile token server-side. This is the check that
 * matters — the honeypot only catches bots that render the page, whereas most
 * spam POSTs directly to the form action.
 */
async function verifyTurnstile(
	token: string | undefined
): Promise<{ ok: true } | { ok: false; message: string }> {
	const secret = env.TURNSTILE_SECRET_KEY

	if (!secret) {
		// `dev` (not isDev()) on purpose: it is compiled to a constant false in any
		// build, so whether we fail closed does not depend on which env vars the
		// runtime happens to expose. isDev() keys off CI at request time, which is
		// too fragile a basis for a security decision.
		if (dev) {
			console.warn('⚠️ TURNSTILE_SECRET_KEY not set — skipping anti-spam check in development')
			return { ok: true }
		}
		// Fail closed: a misconfigured deploy must not silently reopen the form to bots.
		console.error('TURNSTILE_SECRET_KEY is not configured')
		return {
			ok: false,
			message: 'Spam protection is unavailable. Please email contact@pauseai.info instead.'
		}
	}

	if (!token) {
		return {
			ok: false,
			message: 'Please wait for the anti-spam check to complete, then send your message again.'
		}
	}

	try {
		const response = await fetch(TURNSTILE_VERIFY_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ secret, response: token })
		})

		const result: unknown = await response.json()

		if (isTurnstileVerification(result) && result.success === true) {
			return { ok: true }
		}

		console.warn(
			'Turnstile rejected a submission:',
			isTurnstileVerification(result) ? result['error-codes'] : result
		)
		return {
			ok: false,
			message: 'The anti-spam check failed. Please reload the page and try again.'
		}
	} catch (error) {
		console.error('Turnstile verification error:', error)
		return {
			ok: false,
			message: 'Could not complete the anti-spam check. Please try again in a moment.'
		}
	}
}

async function sendContactEmail(data: {
	name: string
	email: string
	subject: string
	message: string
	type: ContactFormType
	organization?: string
	city_country?: string
}) {
	if (!mailerSendApiKey) {
		console.error('MAILERSEND_API_KEY is not configured')
		return {
			success: false,
			message: 'Email service is not configured. Please contact the administrator.'
		}
	}

	const recipientEmail = CONTACT_RECIPIENTS[data.type]

	// Everything interpolated below is attacker-controlled, so it is escaped:
	// unescaped input let spammers inject live links into the team's inbox.
	let htmlContent = `
		<p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
		<p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
		<p><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
	`

	if (data.organization) {
		htmlContent += `<p><strong>Organization:</strong> ${escapeHtml(data.organization)}</p>`
	}

	if (data.city_country) {
		htmlContent += `<p><strong>City, Country:</strong> ${escapeHtml(data.city_country)}</p>`
	}

	htmlContent += `<p><strong>Message:</strong></p><p>${escapeHtml(data.message).replace(/\n/g, '<br>')}</p>`

	const textContent = `Name: ${data.name}\nEmail: ${data.email}\nSubject: ${data.subject}${data.organization ? `\nOrganization: ${data.organization}` : ''}${data.city_country ? `\nCity, Country: ${data.city_country}` : ''}\n\nMessage:\n${data.message}`

	// Build the request body for MailerSend API
	const emailBody: {
		from: { email: string; name: string }
		to: { email: string; name: string }[]
		subject: string
		html: string
		text: string
		reply_to?: { email: string; name: string }
	} = {
		from: {
			email: 'info@pauseai.info',
			name: `PauseAI ${data.type} Form`
		},
		to: [
			{
				email: recipientEmail,
				name: 'PauseAI Team'
			}
		],
		subject: `[${data.type} Form]: ${data.subject}`,
		html: htmlContent,
		text: textContent
	}

	if (data.email) {
		emailBody.reply_to = {
			email: data.email,
			name: data.name
		}
	}

	try {
		const response = await fetch('https://api.mailersend.com/v1/email', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${mailerSendApiKey}`
			},
			body: JSON.stringify(emailBody)
		})

		if (!response.ok) {
			const errorData: unknown = await response.json().catch((): unknown => ({}))
			console.error('MailerSend Error:', response.status, JSON.stringify(errorData, null, 2))

			let errorMessage = 'Failed to send email. Please try again later.'
			if (isMailerSendError(errorData) && typeof errorData.message === 'string') {
				errorMessage = errorData.message.replace('reply to.email', 'email')
			}

			return { success: false, message: errorMessage }
		}

		// Save to Airtable - sending full content in the Message field
		await createRecord(CONTACT_AIRTABLE_BASE_ID, CONTACT_AIRTABLE_TABLE_ID, {
			Message: textContent,
			Type: data.type
		})

		return { success: true }
	} catch (error: unknown) {
		console.error('MailerSend Error:', error)

		let errorMessage = 'Failed to send email. Please try again later.'
		if (error instanceof Error && error.message) {
			errorMessage = error.message
		}

		return { success: false, message: errorMessage }
	}
}

async function sendConfirmationEmail(data: { name: string; email: string; type: ContactFormType }) {
	if (!mailerSendApiKey || !data.email) return

	const teamEmail = CONTACT_RECIPIENTS[data.type]

	const emailBody = {
		from: {
			email: teamEmail,
			name: 'PauseAI Team'
		},
		reply_to: {
			email: teamEmail,
			name: 'PauseAI Team'
		},
		to: [
			{
				email: data.email,
				name: data.name
			}
		],
		subject: 'Thank you for contacting PauseAI',
		html: `
			<p>Hello,</p>
			<p>Thank you for your interest — we appreciate you reaching out.</p>
			<p>We’ve received your inquiry, and a member of our team will respond promptly.</p>
			<p>We are a small team, therefore we aim to get back to you within 3 – 4 business days.</p>
			<p>Thanks again for your patience and interest.</p>
			<br>
			<p>Best regards,</p>
			<p>Pause AI team</p>
		`,
		text: `Hello,\n\nThank you for your interest — we appreciate you reaching out.\n\nWe’ve received your inquiry, and a member of our team will respond promptly.\n\nWe are a small team, therefore we aim to get back to you within 3 – 4 business days.\n\nThanks again for your patience and interest.\n\n\nBest regards,\n\nPause AI team`
	}

	try {
		await fetch('https://api.mailersend.com/v1/email', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${mailerSendApiKey}`
			},
			body: JSON.stringify(emailBody)
		})
	} catch (error) {
		console.error('Failed to send confirmation email:', error)
	}
}

/**
 * The anti-bot gate shared by every form, cheapest check first.
 * `drop` means silently pretend success, so a bot does not learn it was caught.
 */
async function checkNotSpam(
	data: FormData
): Promise<{ drop: true } | { drop: false; message?: string }> {
	// Hidden field that only an automated form-filler completes.
	if (getFormString(data, 'nickname')) return { drop: true }

	const verification = await verifyTurnstile(getFormString(data, TURNSTILE_FIELD))
	if (!verification.ok) return { drop: false, message: verification.message }

	return { drop: false }
}

export const actions: Actions = {
	media: async ({ request }) => {
		const data = await request.formData()

		const spam = await checkNotSpam(data)
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

		const result = await sendContactEmail({
			name,
			email,
			subject,
			message: details,
			organization,
			type: 'Media'
		})

		if (!result.success) {
			return fail(500, { message: result.message })
		}

		await sendConfirmationEmail({ name, email, type: 'Media' })

		return { success: true }
	},
	partnerships: async ({ request }) => {
		const data = await request.formData()

		const spam = await checkNotSpam(data)
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

		const result = await sendContactEmail({
			name,
			email,
			organization,
			city_country,
			subject,
			message,
			type: 'Partnerships'
		})

		if (!result.success) {
			return fail(500, { message: result.message })
		}

		await sendConfirmationEmail({ name, email, type: 'Partnerships' })

		return { success: true }
	},
	feedback: async ({ request }) => {
		const data = await request.formData()

		const spam = await checkNotSpam(data)
		if (spam.drop) return { success: true }
		if (spam.message) return fail(403, { message: spam.message })

		const oversized = findOversizedField(data)
		if (oversized) return fail(400, { message: oversized })

		const name = getFormString(data, 'name') ?? 'Anonymous'
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

		const result = await sendContactEmail({
			name,
			email,
			subject,
			message,
			type: 'Feedback'
		})

		if (!result.success) {
			return fail(500, { message: result.message })
		}

		if (email) {
			await sendConfirmationEmail({ name, email, type: 'Feedback' })
		}

		return { success: true }
	}
}
