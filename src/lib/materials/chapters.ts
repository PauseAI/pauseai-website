/**
 * Where a design or code points people to: PauseAI as a whole, or one of its national chapters. The chapters come
 * from the site's own list ($lib/data/national-chapters.json, kept in sync with the chapter directory by
 * `pnpm sync:national-chapters`), so the tools never keep a list of their own.
 */
import nationalChaptersJson from '$lib/data/national-chapters.json'
import { inBrandFonts } from './canvasFonts'
import { displayLink } from './qrCaption'
import { getTemplate } from './templates'

export interface Chapter {
	/** Empty for PauseAI as a whole. Otherwise the chapter's country, in English, as the chapter list names it. */
	id: string
	/** How a volunteer finds it in a list: "United Kingdom", or "Germany (Deutschland)". */
	label: string
	/** The country's English name, or empty for PauseAI as a whole. */
	country: string
	/** The chapter's own site or group link, or pauseai.info. */
	link: string
	/** What a design's header calls the country: its local name where the list has one, "UK" for the United Kingdom. */
	shortName: string
	/** The chapter's Luma calendar, for filling in a design from one of its events. */
	lumaCalendarId?: string
}

export const GLOBAL_LINK = 'https://pauseai.info'

export const GLOBAL_CHAPTER: Chapter = {
	id: '',
	label: 'Global (no country)',
	country: '',
	link: GLOBAL_LINK,
	shortName: ''
}

type ChapterEntry = { name: string; country_local?: string; link: string; lumaCalendarId?: string }

/** Names too long for a design's header, and what volunteers there call their country. */
const SHORT_NAMES: Record<string, string> = { 'United Kingdom': 'UK' }

/** National chapters, by English name. */
export const CHAPTERS: Chapter[] = (nationalChaptersJson.communities as ChapterEntry[])
	.map(({ name, country_local, link, lumaCalendarId }) => ({
		id: name,
		label: country_local && country_local !== name ? `${name} (${country_local})` : name,
		country: name,
		link,
		// The local name, unless it's in a script the brand fonts don't have (日本), which would be drawn in
		// whatever font the device has.
		shortName:
			SHORT_NAMES[name] ?? (country_local && inBrandFonts(country_local) ? country_local : name),
		lumaCalendarId
	}))
	.sort((a, b) => a.label.localeCompare(b.label, 'en'))

/** PauseAI as a whole first, then the national chapters. */
export const CHAPTER_CHOICES: Chapter[] = [GLOBAL_CHAPTER, ...CHAPTERS]

/** The chapter with this id, or PauseAI as a whole. */
export function getChapter(id: string): Chapter {
	return CHAPTERS.find((c) => c.id === id) ?? GLOBAL_CHAPTER
}

/**
 * A link short and plain enough to print: the chapter's own site ("pauseai.uk", "pause-ai.de"), or pauseai.info/join
 * when the chapter's link is a group chat or social media profile, which reads as a code and may change.
 */
export function printableLink(chapter: Chapter): string {
	if (!chapter.id) return 'pauseai.info/join'
	try {
		const { hostname } = new URL(chapter.link)
		if (/pause/i.test(hostname)) return displayLink(chapter.link)
	} catch {
		// Fall through to the global link.
	}
	return 'pauseai.info/join'
}

/** The chapter's events page, or PauseAI's, which lists every chapter's events. */
export function eventsLink(chapter: Chapter): string {
	const link = printableLink(chapter)
	return link === 'pauseai.info/join' ? 'pauseai.info/events' : link
}

/** "PauseAI UK", "PauseAI Deutschland", or "PauseAI" for PauseAI as a whole. */
export function chapterName(chapter: Chapter): string {
	return chapter.shortName ? `PauseAI ${chapter.shortName}` : 'PauseAI'
}

/**
 * Field defaults that depend on the chapter: the Announcement's button, the web address and the Quote's role. The rest of a
 * layout's defaults are the same everywhere. A button that would be too long for its field says
 * "Join PauseAI".
 */
export function chapterFieldDefaults(chapter: Chapter, templateId: string): Record<string, string> {
	const join = `Join ${chapterName(chapter)}`
	const ctaMax = getTemplate(templateId).fields.find((f) => f.key === 'cta')?.maxLength ?? Infinity
	return {
		...(templateId === 'announcement'
			? { cta: join.length <= ctaMax ? join : 'Join PauseAI' }
			: {}),
		url: templateId === 'event' ? eventsLink(chapter) : printableLink(chapter),
		...(templateId === 'quote' ? { role: `${chapterName(chapter)} volunteer` } : {})
	}
}
