import { describe, expect, it } from 'vitest'
import { parseGalleryProject, serializeGalleryProject, type GalleryProject } from './galleryProject'
import { DEFAULT_SLIDE_PHOTO_SETTINGS, SLIDE_PHOTO_VISIBLE } from './gallery'
import { tintVisible } from './design'

const project: GalleryProject = {
	platforms: ['instagram'],
	slides: [
		{
			photo: { kind: 'library', id: 'london-2025' },
			photoSettings: { zoom: 2, focalX: 0.3, focalY: 0.5, visible: SLIDE_PHOTO_VISIBLE },
			caption: 'One',
			themeId: 'black'
		},
		{
			photo: null,
			photoSettings: { ...DEFAULT_SLIDE_PHOTO_SETTINGS },
			caption: 'Two',
			themeId: 'orange'
		}
	]
}

const withVisible = (visible: unknown) => {
	const o = JSON.parse(serializeGalleryProject(project))
	o.slides[0].photoSettings.visible = visible
	return parseGalleryProject(JSON.stringify(o))
}

describe('gallery projects', () => {
	it('gives slides Medium colour over the photo', () => {
		expect(DEFAULT_SLIDE_PHOTO_SETTINGS.visible).toBe(tintVisible('medium'))
	})

	it('round-trips a gallery', () => {
		expect(parseGalleryProject(serializeGalleryProject(project))).toEqual({ ok: true, project })
	})

	it('opens every slide on Medium, whatever strength an older file saved', () => {
		for (const visible of [1, 0.25, 0.6, 'x']) {
			const result = withVisible(visible)
			expect(result.ok && result.project.slides[0].photoSettings.visible).toBe(SLIDE_PHOTO_VISIBLE)
		}
	})

	it('ignores the single format that older files could pick for the whole gallery', () => {
		const o = JSON.parse(serializeGalleryProject(project))
		Object.assign(o, { formatId: 'a5', customFormat: true })
		expect(parseGalleryProject(JSON.stringify(o))).toEqual({ ok: true, project })
	})
})
