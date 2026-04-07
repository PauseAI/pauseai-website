import type { NationalGroupsApiResponse } from '$api/national-groups/+server.js'

/**
 * Fetches national groups data from the API
 * @returns {Promise<NationalGroupsApiResponse>} The list of national groups
 */
export async function fetchNationalGroups(): Promise<NationalGroupsApiResponse> {
	try {
		const response = await fetch('/api/national-groups')
		if (!response.ok) {
			throw new Error('Failed to fetch national groups')
		}
		const data = (await response.json()) as NationalGroupsApiResponse
		return data
	} catch (error) {
		console.error('Error loading national groups:', error)
		return []
	}
}
