import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import cloudinary, { hasCloudinaryCredentials, credentialsError } from '$lib/cloudinary'

export const POST: RequestHandler = async ({ request }) => {
	if (!hasCloudinaryCredentials()) return credentialsError()

	try {
		const { public_id, email } = await request.json()

		if (!public_id || !email) {
			return json({ error: 'Missing public_id or email' }, { status: 400 })
		}

		// Basic email validation
		if (!email.includes('@') || !email.includes('.')) {
			return json({ error: 'Invalid email format' }, { status: 400 })
		}

		// Add email to context metadata
		await cloudinary.uploader.add_context(`email=${email}`, [public_id])

		// Add tag to indicate email was provided
		await cloudinary.uploader.add_tag('has_email', [public_id])

		return json({
			success: true,
			message: 'Email added successfully',
			public_id: public_id
		})
	} catch (error) {
		console.error('Error adding email:', error)
		return json({ error: 'Failed to add email' }, { status: 500 })
	}
}
