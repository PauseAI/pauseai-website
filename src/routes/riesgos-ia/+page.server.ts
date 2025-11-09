import type { PageServerLoad } from './$types'

export interface AdventDay {
	day: number
	title: string
	brief: string
	slug: string
	unlockDate: Date
	isUnlocked: boolean
	content?: string
}

// Event configuration
const EVENT_START_YEAR = 2025
const EVENT_START_MONTH = 10 // November (0-indexed: Jan=0, ..., Nov=10, Dec=11)
const EVENT_START_DAY = 30
const TOTAL_DAYS = 27

export const load: PageServerLoad = async ({ url }) => {
	// Get current date (server-side)
	const currentDate = getCurrentDate(url)

	// Load all advent markdown files
	const adventDays = await loadAdventDays(currentDate)

	return {
		adventDays,
		currentDate: currentDate.toISOString()
	}
}

function getCurrentDate(url: URL): Date {
	// Check for test_date query parameter
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
	// Day 1 unlocks on Nov 30, Day 2 on Dec 1, etc.
	const unlockDate = new Date(EVENT_START_YEAR, EVENT_START_MONTH, EVENT_START_DAY)
	unlockDate.setDate(unlockDate.getDate() + (day - 1))
	return unlockDate
}

function isUnlocked(day: number, currentDate: Date): boolean {
	const unlockDate = getUnlockDate(day)
	// Set to start of day for comparison
	const unlockDateStart = new Date(unlockDate)
	unlockDateStart.setHours(0, 0, 0, 0)

	const currentDateStart = new Date(currentDate)
	currentDateStart.setHours(0, 0, 0, 0)

	return currentDateStart >= unlockDateStart
}

async function loadAdventDays(currentDate: Date): Promise<AdventDay[]> {
	// Import all markdown files from the riesgos-ia directory
	const modules = import.meta.glob('/src/posts/riesgos-ia/dia-*.md', { eager: true })

	const days: AdventDay[] = []

	for (const path in modules) {
		const module = modules[path] as any

		// Extract day number from filename (dia-01.md -> 1)
		const match = path.match(/dia-(\d+)\.md$/)
		if (!match) continue

		const dayNumber = parseInt(match[1], 10)
		const unlockDate = getUnlockDate(dayNumber)
		const unlocked = isUnlocked(dayNumber, currentDate)

		const metadata = module.metadata || {}

		days.push({
			day: dayNumber,
			title: metadata.title || `Día ${dayNumber}`,
			brief: metadata.brief || '',
			slug: metadata.slug || `dia-${dayNumber}`,
			unlockDate,
			isUnlocked: unlocked,
			// Only include content if unlocked
			content: unlocked && module.default ? module.default.render().html : undefined
		})
	}

	// Sort by day number
	days.sort((a, b) => a.day - b.day)

	// Fill in missing days with placeholders (in case some markdown files don't exist yet)
	for (let i = 1; i <= TOTAL_DAYS; i++) {
		if (!days.find((d) => d.day === i)) {
			days.push({
				day: i,
				title: `Día ${i}`,
				brief: '',
				slug: `dia-${i}`,
				unlockDate: getUnlockDate(i),
				isUnlocked: isUnlocked(i, currentDate),
				content: undefined
			})
		}
	}

	// Sort again after adding placeholders
	days.sort((a, b) => a.day - b.day)

	return days.slice(0, TOTAL_DAYS)
}
