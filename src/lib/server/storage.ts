import { getStore } from '@netlify/blobs'

// Initialize the blob store
const jobStore = getStore('email-jobs')

// Storage interface functions
export const JobStorage = {
	// Create new job entry
	async createJob(jobId, initialWriteState) {
		const jobData = {
			jobId,
			status: 'pending',
			writeState: initialWriteState,
			createdAt: new Date().toISOString(),
			error: null,
			completedAt: null
		}

		await jobStore.set(jobId, JSON.stringify(jobData))
		return jobData
	},

	// Get job by ID
	async getJob(jobId) {
		try {
			const data = await jobStore.get(jobId)
			if (!data) return null
			return JSON.parse(data)
		} catch (error) {
			console.error('Error retrieving job:', error)
			return null
		}
	},

	// Update job status
	async updateJobStatus(jobId, status, error = null) {
		const jobData = await this.getJob(jobId)
		if (!jobData) throw new Error(`Job ${jobId} not found`)

		jobData.status = status
		jobData.error = error

		if (status === 'completed' || status === 'failed') {
			jobData.completedAt = new Date().toISOString()
		}

		await jobStore.set(jobId, JSON.stringify(jobData))
		return jobData
	},

	// Update WriteState for job
	async updateWriteState(jobId, newWriteState) {
		const jobData = await this.getJob(jobId)
		if (!jobData) throw new Error(`Job ${jobId} not found`)

		jobData.writeState = newWriteState
		jobData.status = 'processing'

		await jobStore.set(jobId, JSON.stringify(jobData))
		return jobData
	},

	// Complete job with final results
	async completeJob(jobId, finalWriteState) {
		const jobData = await this.getJob(jobId)
		if (!jobData) throw new Error(`Job ${jobId} not found`)

		jobData.writeState = finalWriteState
		jobData.status = 'completed'
		jobData.completedAt = new Date().toISOString()

		await jobStore.set(jobId, JSON.stringify(jobData))
		return jobData
	},

	// Mark job as failed
	async failJob(jobId, errorMessage) {
		return await this.updateJobStatus(jobId, 'failed', errorMessage)
	},

	// Delete job (cleanup)
	async deleteJob(jobId) {
		await jobStore.delete(jobId)
	},

	// List all jobs (for debugging/admin)
	async listJobs() {
		const { blobs } = await jobStore.list()
		return blobs.map((blob) => blob.key)
	}
}

// Utility function to generate unique job IDs
export function generateJobId() {
	return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
