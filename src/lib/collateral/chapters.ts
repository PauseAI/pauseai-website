/**
 * Where a design or code points people to: PauseAI as a whole, or one of its national chapters. The chapters come
 * from the site's own list ($lib/data/national-chapters.json, kept in sync with the chapter directory by
 * `pnpm sync:national-chapters`), so the tools never keep a list of their own.
 */
import nationalChaptersJson from '$lib/data/national-chapters.json'

export interface Chapter {
	/** Empty for PauseAI as a whole. Otherwise the chapter's country, in English, as the chapter list names it. */
	id: string
	/** How a volunteer finds it in a list: "United Kingdom", or "Germany (Deutschland)". */
	label: string
	/** The country's English name, or empty for PauseAI as a whole. */
	country: string
	/** The chapter's own site or group link, or pauseai.info. */
	link: string
}

export const GLOBAL_LINK = 'https://pauseai.info'

export const GLOBAL_CHAPTER: Chapter = {
	id: '',
	label: 'Global (no country)',
	country: '',
	link: GLOBAL_LINK
}

type ChapterEntry = { name: string; country_local?: string; link: string }

/** National chapters, by English name. */
export const CHAPTERS: Chapter[] = (nationalChaptersJson.communities as ChapterEntry[])
	.map(({ name, country_local, link }) => ({
		id: name,
		label: country_local && country_local !== name ? `${name} (${country_local})` : name,
		country: name,
		link
	}))
	.sort((a, b) => a.label.localeCompare(b.label, 'en'))

/** PauseAI as a whole first, then the national chapters. */
export const CHAPTER_CHOICES: Chapter[] = [GLOBAL_CHAPTER, ...CHAPTERS]

/** The chapter with this id, or PauseAI as a whole. */
export function getChapter(id: string): Chapter {
	return CHAPTERS.find((c) => c.id === id) ?? GLOBAL_CHAPTER
}
