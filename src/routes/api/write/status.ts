import { json } from '@sveltejs/kit'
import { JobStorage } from '$lib/storage.js'

export async function GET({ url }) {
	const jobId = url.searchParams.get('jobId')

	if (!jobId) {
		return json({ error: 'Job ID is required' }, { status: 400 })
	}

	try {
		const jobData = await JobStorage.getJob(jobId)

		if (!jobData) {
			return json({ error: 'Job not found' }, { status: 404 })
		}

		// Prepare response using your existing function
		const response = prepareResponse(jobData.writeState)

		return json({
			...response,
			jobId,
			status: jobData.status,
			error: jobData.error,
			createdAt: jobData.createdAt,
			completedAt: jobData.completedAt
		})
	} catch (error) {
		console.error('Error checking job status:', error)
		return json({ error: 'Internal server error' }, { status: 500 })
	}
}

// Also support POST for compatibility
export async function POST({ request }) {
	const { jobId } = await request.json()

	if (!jobId) {
		return json({ error: 'Job ID is required' }, { status: 400 })
	}

	try {
		const jobData = await JobStorage.getJob(jobId)

		if (!jobData) {
			return json({ error: 'Job not found' }, { status: 404 })
		}

		const response = prepareResponse(jobData.writeState)

		return json({
			...response,
			jobId,
			status: jobData.status,
			error: jobData.error
		})
	} catch (error) {
		console.error('Error checking job status:', error)
		return json({ error: 'Internal server error' }, { status: 500 })
	}
}
