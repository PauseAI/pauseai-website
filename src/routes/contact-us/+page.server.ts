import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'
import { env } from '$env/dynamic/private'
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'

export const prerender = false

const mailersend = new MailerSend({
	apiKey: env.MAILERSEND_API_KEY || ''
})
// a
async function sendContactEmail(data: {
	name: string
	email: string
	subject: string
	message: string
	type: 'Standard' | 'Media' | 'Partnerships' | 'Feedback'
	organization?: string
}) {
	const sentFrom = new Sender('info@pauseai.info', 'PauseAI Contact Form')
	const recipientEmail = 'patriciovercesi@gmail.com'
	const recipients = [new Recipient(recipientEmail, 'PauseAI Team')]

	let htmlContent = `
		<p><strong>Name:</strong> ${data.name}</p>
		<p><strong>Email:</strong> ${data.email}</p>
		<p><strong>Subject:</strong> ${data.subject}</p>
	`

	if (data.organization) {
		htmlContent += `<p><strong>Organization:</strong> ${data.organization}</p>`
	}

	htmlContent += `<p><strong>Message:</strong></p><p>${data.message.replace(/\n/g, '<br>')}</p>`

	const emailParams = new EmailParams()
		.setFrom(sentFrom)
		.setTo(recipients)
		.setReplyTo(new Recipient(data.email, data.name))
		.setSubject(`[Contact Form] ${data.subject}`)
		.setHtml(htmlContent)
		.setText(
			`Name: ${data.name}\nEmail: ${data.email}\nSubject: ${data.subject}${data.organization ? `\nOrganization: ${data.organization}` : ''}\n\nMessage:\n${data.message}`
		)

	try {
		await mailersend.email.send(emailParams)
		return { success: true }
	} catch (error: unknown) {
		console.error('MailerSend Error:', JSON.stringify(error, null, 2))

		// Extract specific error message if available from MailerSend
		let errorMessage = 'Failed to send email. Please try again later.'
		const err = error as { body?: { message?: string }; message?: string }
		if (err.body?.message) {
			errorMessage = err.body.message.replace('reply to.email', 'email')
		} else if (err.message) {
			errorMessage = err.message.replace('reply to.email', 'email')
		}

		return { success: false, message: errorMessage }
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

		return { success: true }
	},
	feedback: async ({ request }) => {
		const data = await request.formData()
		const name = data.get('name')?.toString() || 'Anonymous'
		const email = data.get('email')?.toString() || 'anonymous@pauseai.info'
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

		return { success: true }
	}
}
