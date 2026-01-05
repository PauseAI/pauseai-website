import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'
import { MAILERSEND_API_KEY } from '$env/static/private'
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'

export const prerender = false

const mailersend = new MailerSend({
	apiKey: MAILERSEND_API_KEY
})

async function sendContactEmail(data: {
	name: string
	email: string
	subject: string
	message: string
	type: 'Standard' | 'Media'
	organization?: string
}) {
	const sentFrom = new Sender('info@pauseai.info', 'PauseAI Contact Form')
	const recipients = [new Recipient('patricio@pauseai.info', 'PauseAI Team')]

	let htmlContent = `
		<p><strong>Type:</strong> ${data.type}</p>
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
			`Type: ${data.type}\nName: ${data.name}\nEmail: ${data.email}\nSubject: ${data.subject}${data.organization ? `\nOrganization: ${data.organization}` : ''}\n\nMessage:\n${data.message}`
		)

	try {
		await mailersend.email.send(emailParams)
		return { success: true }
	} catch (error) {
		console.error('MailerSend Error:', error)
		return { success: false, error }
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
			return fail(500, { message: 'Failed to send email. Please try again later.' })
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
			return fail(500, { message: 'Failed to send email. Please try again later.' })
		}

		return { success: true }
	}
}
