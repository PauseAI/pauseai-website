import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import cloudinary, { hasCloudinaryCredentials, credentialsError } from '$lib/cloudinary'

export const POST: RequestHandler = async ({ request }) => {
	if (!hasCloudinaryCredentials()) return credentialsError()

	try {
		const { public_id } = await request.json()

		if (!public_id) {
			return json({ error: 'Missing public_id' }, { status: 400 })
		}

		// Delete the image from Cloudinary
		const result = await cloudinary.uploader.destroy(public_id)

		if (result.result !== 'ok') {
			console.error('Failed to delete image:', result)
			return json({ error: 'Failed to remove image' }, { status: 500 })
		}

		return json({
			success: true,
			message: 'Image removed successfully',
			public_id: public_id
		})
	} catch (error) {
		console.error('Error removing image:', error)
		return json({ error: 'Failed to remove image' }, { status: 500 })
	}
}
