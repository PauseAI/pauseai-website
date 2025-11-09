import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

// Event configuration (must match +page.server.ts)
const EVENT_START_YEAR = 2025
const EVENT_START_MONTH = 10 // November (0-indexed)
const EVENT_START_DAY = 30

export const load: PageLoad = async ({ params, url }) => {
	const { slug } = params

	try {
		// Import all markdown files to find the one with matching slug
		const modules = import.meta.glob('/src/posts/riesgos-ia/dia-*.md', { eager: true })

		let matchedModule: any = null
		let dayNumber: number | null = null

		for (const path in modules) {
			const module = modules[path] as any
			const metadata = module.metadata || {}

			// Check if slug matches
			if (metadata.slug === slug) {
				matchedModule = module
				// Extract day number from filename
				const match = path.match(/dia-(\d+)\.md$/)
				if (match) {
					dayNumber = parseInt(match[1], 10)
				}
				break
			}
		}

		if (!matchedModule || dayNumber === null) {
			throw error(404, `No se encontró el riesgo: ${slug}`)
		}

		const metadata = matchedModule.metadata || {}

		// Check if content is unlocked based on date
		const currentDate = getCurrentDate(url)
		const unlockDate = getUnlockDate(dayNumber)
		const isUnlocked = checkIsUnlocked(unlockDate, currentDate)

		if (!isUnlocked) {
			throw error(403, `Este riesgo estará disponible el ${formatDate(unlockDate)}`)
		}

		return {
			day: dayNumber,
			title: metadata.title || `Día ${dayNumber}`,
			brief: metadata.brief || '',
			slug: metadata.slug || slug,
			date: metadata.date,
			content: matchedModule.default,
			unlockDate,
			isUnlocked
		}
	} catch (e: any) {
		if (e.status) throw e // Re-throw SvelteKit errors
		throw error(404, `No se pudo cargar el riesgo: ${slug}`)
	}
}

function getCurrentDate(url: URL): Date {
	const testDate = url.searchParams.get('test_date')

	if (testDate) {
		try {
			const parsed = new Date(testDate)
			if (!isNaN(parsed.getTime())) {
				return parsed
			}
		} catch (e) {
			console.warn('Invalid test_date parameter:', testDate)
		}
	}

	return new Date()
}

function getUnlockDate(day: number): Date {
	const unlockDate = new Date(EVENT_START_YEAR, EVENT_START_MONTH, EVENT_START_DAY)
	unlockDate.setDate(unlockDate.getDate() + (day - 1))
	return unlockDate
}

function checkIsUnlocked(unlockDate: Date, currentDate: Date): boolean {
	const unlockDateStart = new Date(unlockDate)
	unlockDateStart.setHours(0, 0, 0, 0)

	const currentDateStart = new Date(currentDate)
	currentDateStart.setHours(0, 0, 0, 0)

	return currentDateStart >= unlockDateStart
}

function formatDate(date: Date): string {
	return new Date(date).toLocaleDateString('es-ES', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	})
}
