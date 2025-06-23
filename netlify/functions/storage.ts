// SVELTEKIT SUBSTITUTE: This file already uses Netlify Blobs correctly, minimal changes needed
// SVELTEKIT SUBSTITUTE: Fixed initialization to properly handle Netlify Functions environment

let jobStore: any = null

async function getJobStore() {
	if (!jobStore) {
		const { getStore } = await import('@netlify/blobs')
		jobStore = getStore('email-jobs')
	}
	return jobStore
}

// Storage interface functions
export const JobStorage = {
	// Create new job entry
	async createJob(jobId: string, initialWriteState: any) {
		const store = await getJobStore() // SVELTEKIT SUBSTITUTE: Ensure store is initialized
		const jobData = {
			jobId,
			status: 'pending',
			writeState: initialWriteState,
			createdAt: new Date().toISOString(),
			error: null,
			completedAt: null
		}

		await store.set(jobId, JSON.stringify(jobData))
		return jobData
	},

	// Get job by ID
	async getJob(jobId: string) {
		try {
			const store = await getJobStore() // SVELTEKIT SUBSTITUTE: Ensure store is initialized
			const data = await store.get(jobId)
			if (!data) return null
			return JSON.parse(data)
		} catch (error) {
			console.error('Error retrieving job:', error)
			return null
		}
	},

	// Update job status
	async updateJobStatus(jobId: string, status: string, error: string | null = null) {
		const jobData = await this.getJob(jobId)
		if (!jobData) throw new Error(`Job ${jobId} not found`)

		jobData.status = status
		jobData.error = error

		if (status === 'completed' || status === 'failed') {
			jobData.completedAt = new Date().toISOString()
		}

		const store = await getJobStore() // SVELTEKIT SUBSTITUTE: Ensure store is initialized
		await store.set(jobId, JSON.stringify(jobData))
		return jobData
	},

	// Update WriteState for job
	async updateWriteState(jobId: string, newWriteState: any) {
		const jobData = await this.getJob(jobId)
		if (!jobData) throw new Error(`Job ${jobId} not found`)

		jobData.writeState = newWriteState
		jobData.status = 'processing'

		const store = await getJobStore() // SVELTEKIT SUBSTITUTE: Ensure store is initialized
		await store.set(jobId, JSON.stringify(jobData))
		return jobData
	},

	// Complete job with final results
	async completeJob(jobId: string, finalWriteState: any) {
		const jobData = await this.getJob(jobId)
		if (!jobData) throw new Error(`Job ${jobId} not found`)

		jobData.writeState = finalWriteState
		jobData.status = 'completed'
		jobData.completedAt = new Date().toISOString()

		const store = await getJobStore() // SVELTEKIT SUBSTITUTE: Ensure store is initialized
		await store.set(jobId, JSON.stringify(jobData))
		return jobData
	},

	// Mark job as failed
	async failJob(jobId: string, errorMessage: string) {
		return await this.updateJobStatus(jobId, 'failed', errorMessage)
	},

	// Delete job (cleanup)
	async deleteJob(jobId: string) {
		const store = await getJobStore() // SVELTEKIT SUBSTITUTE: Ensure store is initialized
		await store.delete(jobId)
	},

	// List all jobs (for debugging/admin)
	async listJobs() {
		const store = await getJobStore() // SVELTEKIT SUBSTITUTE: Ensure store is initialized
		const { blobs } = await store.list()
		return blobs.map((blob: any) => blob.key)
	}
}

// Utility function to generate unique job IDs
export function generateJobId(): string {
	return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
