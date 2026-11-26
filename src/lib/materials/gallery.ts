import { tintVisible } from './design'
import type { Format } from './formats'
import { DEFAULT_PHOTO_VIEW } from './photoTransform'
import type { RenderOptions } from './render'
import { getTemplate, type Drawable, type PhotoSettings } from './templates'
import { DEFAULT_THEME_ID, getTheme } from './themes'

export const MIN_SLIDES = 2
export const MAX_SLIDES = 10
export const CAPTION_MAX = 200

/**
 * Slides always have Medium colour over the photo: the caption sits on its own dark band, so it reads whatever the
 * strength, and the lighter step keeps the photo forward while the slide's style still shows.
 */
export const SLIDE_PHOTO_VISIBLE = tintVisible('medium')

export const DEFAULT_SLIDE_PHOTO_SETTINGS: PhotoSettings = {
	...DEFAULT_PHOTO_VIEW,
	visible: SLIDE_PHOTO_VISIBLE
}

export interface SlidePhoto {
	drawable: Drawable
	name: string
	source: { kind: 'library'; id: string } | { kind: 'upload' }
}

export interface Slide {
	id: string
	photo: SlidePhoto | null
	photoSettings: PhotoSettings
	caption: string
	/** Each slide picks its own style, so a carousel can alternate looks. */
	themeId: string
}

let idCounter = 0

export function newSlideId(): string {
	idCounter += 1
	return `slide-${Date.now()}-${idCounter}`
}

/** A first slide to show what a finished one looks like, like the example text in the single-image layouts. */
export const EXAMPLE_SLIDE = {
	photoId: 'san-francisco',
	caption: 'Saturday: PauseAI volunteers in San Francisco, asking for a pause on frontier AI.'
}

export function newSlide(): Slide {
	return {
		id: newSlideId(),
		photo: null,
		photoSettings: { ...DEFAULT_SLIDE_PHOTO_SETTINGS },
		caption: '',
		themeId: DEFAULT_THEME_ID
	}
}

const CAPTION_TEMPLATE = getTemplate('caption')

/**
 * How a slide is drawn, the same for the preview, the filmstrip and the downloads. The caption layout never draws
 * the logo, so any style's logo does: it only satisfies the render API.
 */
export function slideRenderOptions(slide: Slide, format: Format, logo: Drawable): RenderOptions {
	return {
		format,
		template: CAPTION_TEMPLATE,
		theme: getTheme(slide.themeId),
		values: { caption: slide.caption },
		logo,
		photo: slide.photo?.drawable ?? null,
		photoSettings: slide.photoSettings,
		qrCodes: [],
		trackQr: false
	}
}
