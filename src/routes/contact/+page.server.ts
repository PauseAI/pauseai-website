import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'

export const prerender = false

export const actions: Actions = {
	standard: async ({ request }) => {
		const data = await request.formData()
		const name = data.get('name')
		const email = data.get('email')
		const subject = data.get('subject')
		const message = data.get('message')

		// Basic validation
		if (!name || !email || !subject || !message) {
			return fail(400, { message: 'Missing required fields' })
		}

		// In a real application, you would send an email here.
		// For local testing, we'll just log it to the console.
		console.log('--- Standard Contact Form Submission ---')
		console.log('Name:', name)
		console.log('Email:', email)
		console.log('Subject:', subject)
		console.log('Message:', message)
		console.log('---------------------------------------')

		// You could also use a service like Mailtrap for local email testing
		// or just return success and check the logs.

		return { success: true }
	},
	media: async ({ request }) => {
		const data = await request.formData()
		const name = data.get('name')
		const email = data.get('email')
		const phone = data.get('phone')
		const organization = data.get('organization')
		const details = data.get('details')

		// Basic validation
		if (!name || !email || !organization || !details) {
			return fail(400, { message: 'Missing required fields' })
		}

		console.log('--- Media Enquiry Form Submission ---')
		console.log('Name:', name)
		console.log('Email:', email)
		console.log('Phone:', phone)
		console.log('Organization:', organization)
		console.log('Details:', details)
		console.log('------------------------------------')

		return { success: true }
	}
}
