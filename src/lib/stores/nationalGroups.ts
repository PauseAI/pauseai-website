import { writable } from 'svelte/store'
import type { NationalGroup } from '$lib/types'

// Initialize with an empty array
export const nationalGroups = writable<NationalGroup[]>([])

// Function to load national groups data
export async function loadNationalGroups() {
	try {
		const response = await fetch('/api/national-groups')
		if (!response.ok) {
			throw new Error('Failed to fetch national groups')
		}
		const data = await response.json()
		nationalGroups.set(data)
		return data
	} catch (error) {
		console.error('Error loading national groups:', error)
		return []
	}
}
