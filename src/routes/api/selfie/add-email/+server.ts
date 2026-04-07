import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import {
	hasCloudinaryCredentials,
	credentialsError,
	callCloudinaryAPI,
	type CloudinarySimpleResponse
} from '$lib/cloudinary'

type AddEmailRequest = {
	public_id: string
	email: string
}

type SelfieAddEmailApiSuccessResponse = {
	success: true
	message: string
	public_id: string
}

type SelfieAddEmailApiErrorResponse = {
	error: string
}

export type SelfieAddEmailApiResponse =
	| SelfieAddEmailApiSuccessResponse
	| SelfieAddEmailApiErrorResponse

export const POST: RequestHandler = async ({ request }) => {
	if (!hasCloudinaryCredentials()) return credentialsError()

	try {
		const { public_id, email } = (await request.json()) as AddEmailRequest

		if (!public_id || !email) {
			return json(
				{ error: 'Missing public_id or email' } satisfies SelfieAddEmailApiErrorResponse,
				{
					status: 400
				}
			)
		}

		// Basic email validation
		if (!email.includes('@') || !email.includes('.')) {
			return json({ error: 'Invalid email format' } satisfies SelfieAddEmailApiErrorResponse, {
				status: 400
			})
		}

		// Add context (requires 'add' command)
		// Note: public_ids parameter (plural) for the context endpoint
		await callCloudinaryAPI<CloudinarySimpleResponse>('image/context', {
			command: 'add',
			public_ids: [public_id],
			context: `email=${email}`
		})

		// Add tag separately
		// Note: public_ids parameter (plural) for the tags endpoint
		await callCloudinaryAPI<CloudinarySimpleResponse>('image/tags', {
			command: 'add',
			public_ids: [public_id],
			tag: 'has_email'
		})

		return json({
			success: true,
			message: 'Email added successfully',
			public_id: public_id
		} satisfies SelfieAddEmailApiResponse)
	} catch (error) {
		console.error('Error adding email:', error)
		return json({ error: 'Failed to add email' } satisfies SelfieAddEmailApiResponse, {
			status: 500
		})
	}
}
