import { prerender } from '$app/server'
import { fetchPressCoverage, type PressCoverage } from './server/notion-press'

export type { PressCoverage }

export interface PressCoverageData {
	coverage: PressCoverage[]
	typeOrder: string[]
	outletOrder: string[]
}

export const getPressCoverage = prerender(async (): Promise<PressCoverageData> => {
	try {
		return await fetchPressCoverage()
	} catch (e) {
		console.error('Failed to fetch press coverage:', e)
		return { coverage: [], typeOrder: [], outletOrder: [] }
	}
})
