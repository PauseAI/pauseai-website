import { describe, expect, it } from 'vitest'
import {
	BODY_FAMILY,
	CANVAS_FONTS,
	facesFor,
	HEADLINE_FAMILY,
	parseUnicodeRange,
	subsetCovers
} from './canvasFonts'
import { captionFaces } from './qrCaption'

describe('parseUnicodeRange', () => {
	it('reads single code points and ranges', () => {
		expect(parseUnicodeRange('U+0000-00FF,U+0131')).toEqual([
			[0, 255],
			[0x131, 0x131]
		])
	})
})

describe('subsetCovers', () => {
	it('always needs Latin', () => {
		expect(subsetCovers('latin', '')).toBe(true)
	})

	it('needs Latin Extended for Polish, Czech and Romanian letters', () => {
		expect(subsetCovers('latin-ext', 'Join PauseAI')).toBe(false)
		expect(subsetCovers('latin-ext', 'Dołącz do nas')).toBe(true)
		expect(subsetCovers('latin-ext', 'Česko')).toBe(true)
		expect(subsetCovers('latin-ext', 'Pauză')).toBe(true)
	})

	it('needs Cyrillic and Greek only for those scripts', () => {
		expect(subsetCovers('cyrillic', 'Pridruži se')).toBe(false)
		expect(subsetCovers('cyrillic', 'Придружи се')).toBe(true)
		expect(subsetCovers('greek', 'Ελλάδα')).toBe(true)
	})
})

describe('facesFor', () => {
	it('picks only the subsets the text uses', () => {
		expect(facesFor(BODY_FAMILY, '500', 'pauseai.info').map((f) => f.subset)).toEqual(['latin'])
		expect(facesFor(HEADLINE_FAMILY, '700', 'Dołącz').map((f) => f.subset)).toEqual([
			'latin',
			'latin-ext'
		])
	})

	it('has a file for every face', () => {
		for (const face of CANVAS_FONTS) expect(face.file).toBeTruthy()
	})
})

describe('captionFaces', () => {
	it('loads the headline font for the label and the body font for the link', () => {
		const faces = captionFaces({ label: 'Join', link: 'pauseai.info' })
		expect(faces.map((f) => [f.family, f.subset])).toEqual([
			[HEADLINE_FAMILY, 'latin'],
			[BODY_FAMILY, 'latin']
		])
	})
})
