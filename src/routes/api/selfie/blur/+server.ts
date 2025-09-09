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

		// Get the current image info to preserve tags and context
		const resource = await cloudinary.api.resource(public_id, {
			context: true,
			tags: true
		})

		// Get the URL with blur transformation applied
		const blurredUrl = resource.secure_url.replace('/upload/', '/upload/e_blur_faces:2000/')

		// Replace the existing image with the blurred version
		// Using the same public_id with overwrite: true
		// Note: Don't specify 'folder' since it's already part of the public_id
		const uploadResult = await cloudinary.uploader.upload(blurredUrl, {
			public_id: public_id,
			overwrite: true,
			invalidate: true, // Clear CDN cache
			tags: [...(resource.tags || []), 'face_masked'],
			context: resource.context?.custom || {}
		})

		// Return the replaced image info
		return json({
			success: true,
			url: uploadResult.secure_url,
			public_id: public_id, // Same ID - replaced in place
			note: 'Image permanently blurred in place'
		})
	} catch (error) {
		console.error('Error applying blur:', error)
		return json({ error: 'Failed to apply blur' }, { status: 500 })
	}
}
