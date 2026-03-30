import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { hasCloudinaryCredentials, credentialsError, callCloudinaryAPI } from '$lib/cloudinary'

type SelfieRemoveApiSuccessResponse = {
	success: true
	message: string
	public_id: string
}

type SelfieRemoveApiErrorResponse = {
	error: string
}

export type SelfieRemoveApiResponse = SelfieRemoveApiSuccessResponse | SelfieRemoveApiErrorResponse

export const POST: RequestHandler = async ({ request }) => {
	if (!hasCloudinaryCredentials()) return credentialsError()

	try {
		const { public_id } = await request.json()

		if (!public_id) {
			return json({ error: 'Missing public_id' } satisfies SelfieRemoveApiResponse, {
				status: 400
			})
		}

		// Delete the image from Cloudinary
		const result = await callCloudinaryAPI('image/destroy', {
			public_id: public_id
		})

		if (result.result !== 'ok') {
			console.error('Failed to delete image:', result)
			return json({ error: 'Failed to remove image' } satisfies SelfieRemoveApiResponse, {
				status: 500
			})
		}

		return json({
			success: true,
			message: 'Image removed successfully',
			public_id: public_id
		} satisfies SelfieRemoveApiResponse)
	} catch (error) {
		console.error('Error removing image:', error)
		return json({ error: 'Failed to remove image' } satisfies SelfieRemoveApiResponse, {
			status: 500
		})
	}
}
