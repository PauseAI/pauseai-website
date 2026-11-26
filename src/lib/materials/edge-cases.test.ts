// Edge cases of the materials tool's smaller modules: unusual input,
// fallbacks and the less common branches their own test files don't reach.
import { describe, expect, it } from 'vitest'
import { tintVisible } from './design'
import { eventDayLabel, eventFieldValues, eventLink, type CalendarEvent } from './eventText'
import { FORMATS, formatDimensionLabel, previewStyle } from './formats'
import { parseGalleryProject } from './galleryProject'
import { ALL_PLATFORM_IDS } from './platforms'
import { parsePackProject } from './packProject'
import { panPhoto, zoomPhoto } from './photoTransform'
import { parseProject } from './project'
import { contrastRatio } from './themes'
import { wrapLines, type Measure } from './text'

const measure: Measure = (text, size) => text.length * size * 0.5

describe('photo panning and zooming', () => {
	const square = { w: 500, h: 500 }

	it('only pans along the direction the photo overflows', () => {
		const tall = { w: 500, h: 1000 }
		// A tall photo in a square box can move up and down, not sideways.
		expect(panPhoto(tall, square, { zoom: 1, focalX: 0.5, focalY: 0.5 }, 100, 100)).toEqual({
			zoom: 1,
			focalX: 0.5,
			focalY: 0.3
		})
	})

	it('centres an axis with nothing to scroll after zooming', () => {
		const wide = { w: 1000, h: 500 }
		const out = zoomPhoto(wide, square, { zoom: 1, focalX: 0.5, focalY: 0.5 }, 1, {
			x: 250,
			y: 250
		})
		expect(out.focalY).toBe(0.5)
		expect(out.focalX).toBeCloseTo(0.5)
	})
})

describe('saved gallery projects', () => {
	const ok = (extra: Record<string, unknown>) =>
		JSON.stringify({ app: 'pauseai-collateral-gallery', version: 1, ...extra })

	it("rejects files that aren't gallery projects, or are from a newer tool", () => {
		expect(parseGalleryProject('not json')).toEqual({
			ok: false,
			error: 'That file is not a saved gallery project.'
		})
		expect(parseGalleryProject('[]')).toEqual({
			ok: false,
			error: 'That file is not a saved gallery project.'
		})
		expect(parseGalleryProject(JSON.stringify({ app: 'something-else', version: 1 })).ok).toBe(
			false
		)
		expect(parseGalleryProject(ok({ version: 999 }))).toEqual({
			ok: false,
			error: 'This project was saved by a newer version of the tool.'
		})
		expect(parseGalleryProject(ok({ version: '1' })).ok).toBe(false)
	})

	it('copes with missing slides and platforms', () => {
		const result = parseGalleryProject(ok({ slides: 'nope', platforms: 'nope' }))
		expect(result).toEqual({ ok: true, project: { slides: [], platforms: ALL_PLATFORM_IDS } })
	})

	it('keeps known platforms and falls back to all when none are known', () => {
		expect(parseGalleryProject(ok({ platforms: ['x', 'myspace'] }))).toMatchObject({
			project: { platforms: ['x'] }
		})
		expect(parseGalleryProject(ok({ platforms: ['myspace'] }))).toMatchObject({
			project: { platforms: ALL_PLATFORM_IDS }
		})
	})

	it('keeps a choice of no platforms', () => {
		expect(parseGalleryProject(ok({ platforms: [] }))).toMatchObject({ project: { platforms: [] } })
	})
})

describe('saved campaign packs', () => {
	it("rejects files that aren't packs, or are from a newer tool", () => {
		expect(parsePackProject('{')).toEqual({
			ok: false,
			error: 'That file is not a saved campaign pack.'
		})
		expect(parsePackProject(JSON.stringify({ app: 'nope' })).ok).toBe(false)
		const newer = parsePackProject(JSON.stringify({ app: 'pauseai-collateral-pack', version: 999 }))
		expect(newer).toEqual({
			ok: false,
			error: 'This pack was saved by a newer version of the tool.'
		})
	})
})

describe('format labels', () => {
	const print = FORMATS.find((f) => f.kind === 'print')!
	const shown = FORMATS.find((f) => f.kind === 'digital' && f.shownAtPx)!
	const unshown = FORMATS.find((f) => f.kind === 'digital' && !f.shownAtPx)!

	it('gives print sizes in millimetres and screen sizes in pixels', () => {
		expect(formatDimensionLabel(print)).toMatch(/^\d+ × \d+ mm$/)
		expect(formatDimensionLabel(unshown)).toMatch(/^\d+ × \d+ px$/)
		expect(formatDimensionLabel(shown)).toMatch(/^\d+ × \d+ px · shown ~\d+ px$/)
	})

	it('previews a format at the size the platform shows it, when it says', () => {
		expect(previewStyle(shown)).toEqual({ width: shown.kind === 'digital' ? shown.shownAtPx : 0 })
		expect(previewStyle(unshown)).toBeUndefined()
		expect(previewStyle(print)).toBeUndefined()
	})
})

describe('small fallbacks', () => {
	it('treats an unknown tint step as medium', () => {
		expect(tintVisible('loud' as never)).toBe(tintVisible('medium'))
	})

	it("treats a colour it can't read as black", () => {
		expect(contrastRatio('not a colour', '#ffffff')).toBe(21)
	})

	it('keeps blank lines when wrapping', () => {
		expect(wrapLines(measure, 'One\n\nTwo', 10, 1000)).toEqual(['One', '', 'Two'])
	})
})

describe('calendar events', () => {
	const ev: CalendarEvent = {
		id: 'abc123',
		name: 'Letter writing',
		startAt: '2026-10-28T18:30:00Z',
		venue: 'Somewhere'
	}

	it("labels the day in UTC when the event has no time zone, or one Intl doesn't know", () => {
		const now = new Date('2026-09-01T12:00:00Z')
		expect(eventDayLabel(ev, now)).toBe('Wednesday 28 October')
		expect(eventDayLabel({ ...ev, timezone: 'Mars/Olympus_Mons' }, now)).toBe(
			'Wednesday 28 October'
		)
		expect(eventDayLabel({ ...ev, startAt: new Date().toISOString() })).not.toMatch(/\d{4}$/)
	})

	it("links to the event's own page", () => {
		expect(eventLink(ev)).toBe('lu.ma/abc123')
	})

	it('leaves the end time and group blank when the event has none', () => {
		expect(eventFieldValues(ev)).toMatchObject({
			end: '',
			group: '',
			date: '2026-10-28',
			start: '18:30'
		})
	})
})

describe('zooming a photo that fits exactly', () => {
	it('keeps it centred on both axes', () => {
		const square = { w: 500, h: 500 }
		expect(
			zoomPhoto(square, square, { zoom: 1, focalX: 0.2, focalY: 0.8 }, 1, { x: 0, y: 0 })
		).toEqual({
			zoom: 1,
			focalX: 0.5,
			focalY: 0.5
		})
	})
})

describe('contrast of two unreadable colours', () => {
	it('treats both as black', () => {
		expect(contrastRatio('nope', 'also nope')).toBe(1)
	})
})

describe('saved campaign pack contents', () => {
	const pack = (outputs: unknown) =>
		parsePackProject(JSON.stringify({ app: 'pauseai-collateral-pack', version: 1, outputs }))

	it("copes with outputs that aren't a list, or have no format", () => {
		expect(pack('nope')).toMatchObject({ ok: true })
		const result = pack([{ formatId: 42 }])
		expect(result.ok).toBe(true)
	})
})

describe('saved single-image projects, unusual fields', () => {
	const parse = (extra: Record<string, unknown>) =>
		parseProject(
			JSON.stringify({
				app: 'pauseai-collateral',
				version: 1,
				formatId: 'a5',
				templateId: 'event',
				...extra
			})
		)

	it('names an upload without a name, and a partner logo without a name', () => {
		const dataUrl = 'data:image/png;base64,iVBORw0KGgo='
		const result = parse({
			photo: { kind: 'upload', name: '', dataUrl },
			partnerLogos: [{ name: 7, dataUrl }]
		})
		expect(result).toMatchObject({
			ok: true,
			project: { photo: { name: 'Uploaded photo' }, partnerLogos: [{ name: 'Partner logo' }] }
		})
	})

	it("ignores values that aren't per-layout objects, and a template id that isn't text", () => {
		expect(parse({ values: 'nope', templateId: 12 })).toMatchObject({
			ok: true,
			project: { values: {}, templateId: 'announcement' }
		})
	})

	it('files an old single list of QR codes under the saved layout, and drops empty lists', () => {
		expect(parse({ qrCodes: [{ label: 'Join', url: 'pauseai.uk/join' }] })).toMatchObject({
			project: { qrCodes: { event: [{ label: 'Join', url: 'pauseai.uk/join' }] } }
		})
		expect(parse({ qrCodes: [] })).toMatchObject({ project: { qrCodes: {} } })
		expect(parse({ qrCodes: { event: [], announcement: 'nope' } })).toMatchObject({
			project: { qrCodes: {} }
		})
	})
})
