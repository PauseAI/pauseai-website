import { CAPTION_MAX, MAX_SLIDES, SLIDE_PHOTO_VISIBLE } from './gallery'
import { ALL_PLATFORM_IDS, type PlatformId } from './platforms'
import { isRecord, parsePhotoView, parseProjectPhoto, str, type ProjectPhoto } from './project'
import type { PhotoSettings } from './templates'
import { getTheme } from './themes'

const GALLERY_PROJECT_APP = 'pauseai-collateral-gallery'
const GALLERY_PROJECT_VERSION = 1

export interface GallerySlideData {
	photo: ProjectPhoto | null
	photoSettings: PhotoSettings
	caption: string
	themeId: string
}

/** Everything needed to reopen a gallery. Plain data, so it can be saved as JSON. */
export interface GalleryProject {
	slides: GallerySlideData[]
	/** Which platform cards are checked for the export. */
	platforms: PlatformId[]
}

export function serializeGalleryProject(project: GalleryProject, now = new Date()): string {
	return JSON.stringify(
		{
			app: GALLERY_PROJECT_APP,
			version: GALLERY_PROJECT_VERSION,
			savedAt: now.toISOString(),
			...project
		},
		null,
		2
	)
}

export type GalleryParseResult =
	{ ok: true; project: GalleryProject } | { ok: false; error: string }

/**
 * Reads a saved gallery file. Forgiving about content (unknown ids fall back to defaults, long text is
 * trimmed, extra slides are dropped) and strict about shape, since the file is untrusted input. Older files
 * may name a single format for the whole gallery, which is no longer offered, so it is ignored.
 */
export function parseGalleryProject(text: string): GalleryParseResult {
	let raw: unknown
	try {
		raw = JSON.parse(text)
	} catch {
		return { ok: false, error: 'That file is not a saved gallery project.' }
	}
	if (!isRecord(raw) || raw.app !== GALLERY_PROJECT_APP) {
		return { ok: false, error: 'That file is not a saved gallery project.' }
	}
	if (typeof raw.version !== 'number' || raw.version > GALLERY_PROJECT_VERSION) {
		return { ok: false, error: 'This project was saved by a newer version of the tool.' }
	}

	const rawSlides = Array.isArray(raw.slides) ? raw.slides : []
	const slides: GallerySlideData[] = rawSlides
		.filter(isRecord)
		.slice(0, MAX_SLIDES)
		.map((s) => ({
			photo: parseProjectPhoto(s.photo),
			// Colour strength is fixed for slides now, whatever an older file saved.
			photoSettings: { ...parsePhotoView(s.photoSettings), visible: SLIDE_PHOTO_VISIBLE },
			caption: str(s.caption, CAPTION_MAX),
			themeId: getTheme(str(s.themeId, 40)).id
		}))

	const rawPlatforms = Array.isArray(raw.platforms)
		? raw.platforms.filter((p): p is PlatformId => ALL_PLATFORM_IDS.includes(p as PlatformId))
		: []

	return {
		ok: true,
		project: {
			slides,
			platforms: rawPlatforms.length > 0 ? rawPlatforms : ALL_PLATFORM_IDS
		}
	}
}
