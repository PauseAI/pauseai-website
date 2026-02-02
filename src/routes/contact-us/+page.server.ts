import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'
import { env } from '$env/dynamic/private'

export const prerender = false

// Configure recipient email addresses for each contact form type
const CONTACT_RECIPIENTS = {
	Standard: 'contact@pauseai.info',
	Media: 'press@pauseai.info',
	Partnerships: 'partnerships@pauseai.info',
	Feedback: 'feedback@pauseai.info'
} as const

async function sendContactEmail(data: {
	name: string
	email: string
	subject: string
	message: string
	type: 'Standard' | 'Media' | 'Partnerships' | 'Feedback'
	organization?: string
}) {
	if (!env.MAILERSEND_API_KEY) {
		console.error('MAILERSEND_API_KEY is not configured')
		return {
			success: false,
			message: 'Email service is not configured. Please contact the administrator.'
		}
	}

	const recipientEmail = CONTACT_RECIPIENTS[data.type]

	let htmlContent = `
		<p><strong>Name:</strong> ${data.name}</p>
		<p><strong>Email:</strong> ${data.email}</p>
		<p><strong>Subject:</strong> ${data.subject}</p>
	`

	if (data.organization) {
		htmlContent += `<p><strong>Organization:</strong> ${data.organization}</p>`
	}

	htmlContent += `<p><strong>Message:</strong></p><p>${data.message.replace(/\n/g, '<br>')}</p>`

	const textContent = `Name: ${data.name}\nEmail: ${data.email}\nSubject: ${data.subject}${data.organization ? `\nOrganization: ${data.organization}` : ''}\n\nMessage:\n${data.message}`

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
			name: 'PauseAI Contact Form'
		},
		to: [
			{
				email: recipientEmail,
				name: 'PauseAI Team'
			}
		],
		subject: `[Contact Form] ${data.subject}`,
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
				Authorization: `Bearer ${env.MAILERSEND_API_KEY}`
			},
			body: JSON.stringify(emailBody)
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			console.error('MailerSend Error:', response.status, JSON.stringify(errorData, null, 2))

			let errorMessage = 'Failed to send email. Please try again later.'
			if (errorData.message) {
				errorMessage = errorData.message.replace('reply to.email', 'email')
			}

			return { success: false, message: errorMessage }
		}

		return { success: true }
	} catch (error: unknown) {
		console.error('MailerSend Error:', error)

		let errorMessage = 'Failed to send email. Please try again later.'
		const err = error as { message?: string }
		if (err.message) {
			errorMessage = err.message
		}

		return { success: false, message: errorMessage }
	}
}

async function sendConfirmationEmail(data: {
	name: string
	email: string
	type: keyof typeof CONTACT_RECIPIENTS
}) {
	if (!env.MAILERSEND_API_KEY || !data.email) return

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
				Authorization: `Bearer ${env.MAILERSEND_API_KEY}`
			},
			body: JSON.stringify(emailBody)
		})
	} catch (error) {
		console.error('Failed to send confirmation email:', error)
	}
}

export const actions: Actions = {
	standard: async ({ request }) => {
		const data = await request.formData()
		const name = data.get('name')?.toString()
		const email = data.get('email')?.toString()
		const subject = data.get('subject')?.toString()
		const message = data.get('message')?.toString()

		if (!name || !email || !subject || !message) {
			return fail(400, { message: 'Missing required fields' })
		}

		const result = await sendContactEmail({
			name,
			email,
			subject,
			message,
			type: 'Standard'
		})

		if (!result.success) {
			return fail(500, { message: result.message })
		}

		await sendConfirmationEmail({ name, email, type: 'Standard' })

		return { success: true }
	},
	media: async ({ request }) => {
		const data = await request.formData()
		const name = data.get('name')?.toString()
		const email = data.get('email')?.toString()
		const subject = data.get('subject')?.toString()
		const organization = data.get('organization')?.toString()
		const details = data.get('details')?.toString()

		if (!name || !email || !subject || !organization || !details) {
			return fail(400, { message: 'Missing required fields' })
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
		const name = data.get('name')?.toString()
		const email = data.get('email')?.toString()
		const organization = data.get('organization')?.toString()
		const subject = data.get('subject')?.toString()
		const message = data.get('message')?.toString()

		if (!name || !email || !organization || !subject || !message) {
			return fail(400, { message: 'Missing required fields' })
		}

		const result = await sendContactEmail({
			name,
			email,
			organization,
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
		const name = data.get('name')?.toString() || 'Anonymous'
		const email = data.get('email')?.toString() || ''
		const subject = data.get('subject')?.toString()
		const message = data.get('message')?.toString()

		if (!subject || !message) {
			return fail(400, { message: 'Missing required fields' })
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
