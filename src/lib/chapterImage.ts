export const DEFAULT_CHAPTER_IMAGE = '/images/default.png'

/**
 * An `onerror` handler for a chapter image, which the CRM hosts and so can be down or have
 * dropped the file: shows the default image instead, once, so a failing default cannot loop.
 */
export function useDefaultChapterImage(event: Event): void {
	const image = event.currentTarget as HTMLImageElement
	if (!image.src.endsWith(DEFAULT_CHAPTER_IMAGE)) image.src = DEFAULT_CHAPTER_IMAGE
}
