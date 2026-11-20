import { describe, expect, it } from 'vitest'
import {
	CARD_DESIGNS,
	CARD_FIELDS,
	cardBox,
	cardDefaults,
	cardFieldsFor,
	emailParts,
	layoutCardFace,
	MIN_CARD_PT,
	parseCardSave,
	SAFE_MM,
	TEXT_ASCENT,
	TEXT_DESCENT,
	type CardFace,
	type CardItem,
	type CardMeasure
} from './businessCards'
import { CARD_FONT_FACES } from './cardFonts'
import { CANVAS_FONTS } from './canvasFonts'
import { getChapter, GLOBAL_CHAPTER, printableLink } from './chapters'
import { CARD_FORMATS, getCardFormat, renderSize } from './formats'
import type { Values } from './templates'

// Condensed bold is narrower than the slab, so the fake widths roughly follow the real faces.
const WIDTH: Record<string, number> = { display: 0.45, displayLight: 0.42, bodyLight: 0.55 }
const measure: CardMeasure = (text, size, font) => text.length * size * WIDTH[font]

const FACES: CardFace[] = ['connect', 'logo', 'personal']

const LONG: Values = {
	firstName: 'Maximiliana-Alexandra',
	lastName: 'Vanderbilt-Wolfeschlegelsteinhausen',
	title: 'National Coordinator for Policy, Lobbying and Volunteer Outreach',
	email: 'maximiliana.vanderbilt-wolfeschlegelsteinhausen@pauseai.info',
	area: 'Greater Manchester and the North West of England',
	qrHeading: 'Join our global community today please',
	qr: 'https://pauseai.info/join',
	slogan: 'Don’t allow companies to gamble with our future, or with our children’s future either'
}

const FILLED: Values = {
	...cardDefaults(GLOBAL_CHAPTER),
	firstName: 'Joep',
	lastName: 'Meindertsma',
	title: 'Founder & President',
	email: 'joep@pauseai.info',
	area: 'Utrecht'
}

const EMPTY: Values = cardDefaults(GLOBAL_CHAPTER)

function boxFor(formatId: string, bleed = true) {
	const format = getCardFormat(formatId)
	return cardBox(format, renderSize(format, { bleed }))
}

/** Where an item's ink lands, using the same fake measure. */
function extent(item: CardItem): { x0: number; y0: number; x1: number; y1: number } | null {
	switch (item.kind) {
		case 'text': {
			const w = Math.min(measure(item.text, item.size, item.font), item.maxWidth ?? Infinity)
			return {
				x0: item.x,
				x1: item.x + w,
				y0: item.y - item.size * TEXT_ASCENT,
				y1: item.y + item.size * TEXT_DESCENT
			}
		}
		case 'rule':
			return { x0: item.x, x1: item.x + item.w, y0: item.y, y1: item.y + item.h }
		case 'logo':
			return { x0: item.x, x1: item.x + item.w, y0: item.y, y1: item.y + item.h }
		case 'qr':
			return { x0: item.x, x1: item.x + item.size, y0: item.y, y1: item.y + item.size }
		default:
			// Backgrounds and the faded mark run into the bleed on purpose.
			return null
	}
}

describe('business card formats', () => {
	it('has the UK/EU size first, then the US size', () => {
		expect(CARD_FORMATS.map((f) => [f.id, f.widthMm, f.heightMm])).toEqual([
			['card-eu', 85, 55],
			['card-us', 88.9, 50.8]
		])
		expect(getCardFormat('nope').id).toBe('card-eu')
	})

	it('prints at 300 dpi with 3 mm of bleed on each edge', () => {
		expect(renderSize(getCardFormat('card-eu'), { bleed: true })).toEqual({
			width: 1075,
			height: 720,
			bleedPx: 35,
			dpi: 300
		})
		expect(renderSize(getCardFormat('card-us'), { bleed: true })).toMatchObject({
			width: 1121,
			height: 671,
			bleedPx: 35
		})
	})
})

describe('card fields', () => {
	it('have unique keys and defaults within their limits', () => {
		const keys = CARD_FIELDS.map((f) => f.key)
		expect(new Set(keys).size).toBe(keys.length)
		for (const f of CARD_FIELDS)
			if (f.maxLength) expect(f.default.length).toBeLessThanOrEqual(f.maxLength)
	})

	it('are listed for every design', () => {
		for (const d of CARD_DESIGNS) expect(cardFieldsFor(d).every(Boolean)).toBe(true)
	})

	it("default the QR code to the chapter's link, as the other designs do", () => {
		expect(cardDefaults(GLOBAL_CHAPTER).qr).toBe('pauseai.info/join')
		const uk = getChapter('United Kingdom')
		expect(cardDefaults(uk).qr).toBe(printableLink(uk))
	})

	it('start with the details blank, so the cards print lines to write on', () => {
		expect(EMPTY).toMatchObject({ firstName: '', lastName: '', title: '', email: '', area: '' })
	})
})

describe('emailParts', () => {
	it.each([
		['', { local: '', domain: '@pauseai.info' }],
		['joep', { local: 'joep', domain: '@pauseai.info' }],
		['  joep@pauseai.info ', { local: 'joep', domain: '@pauseai.info' }],
		['sam@pauseai.uk', { local: 'sam', domain: '@pauseai.uk' }]
	])('splits %j', (email, parts) => {
		expect(emailParts(email)).toEqual(parts)
	})
})

describe.each(CARD_FORMATS.map((f) => f.id))('cards on %s', (formatId) => {
	const box = boxFor(formatId)
	const inset = SAFE_MM * box.pxPerMm
	const safe = {
		left: box.bleedPx + inset,
		top: box.bleedPx + inset,
		right: box.width - box.bleedPx - inset,
		bottom: box.height - box.bleedPx - inset
	}
	const minFont = MIN_CARD_PT * (25.4 / 72) * box.pxPerMm

	describe.each([
		['blank', EMPTY],
		['filled', FILLED],
		['very long', LONG]
	])('with %s details', (_, values) => {
		it.each(FACES)('keeps everything on the %s side inside the crop-safe area', (face) => {
			const { items } = layoutCardFace(face, box, values, measure)
			for (const item of items) {
				const e = extent(item)
				if (!e) continue
				const label = item.kind === 'text' ? item.text : item.kind
				expect(e.x0, label).toBeGreaterThanOrEqual(safe.left - 0.5)
				expect(e.x1, label).toBeLessThanOrEqual(safe.right + 0.5)
				expect(e.y0, label).toBeGreaterThanOrEqual(safe.top - 0.5)
				expect(e.y1, label).toBeLessThanOrEqual(safe.bottom + 0.5)
			}
		})

		it.each(FACES)('never prints text on the %s side below the smallest size', (face) => {
			const { items } = layoutCardFace(face, box, values, measure)
			for (const item of items) {
				if (item.kind === 'text')
					expect(item.size, item.text).toBeGreaterThanOrEqual(minFont - 0.01)
			}
		})

		it('keeps the Connect text clear of the QR panel', () => {
			const { items } = layoutCardFace('connect', box, values, measure)
			const panel = items.find((i) => i.kind === 'rect' && i.fill === '#FFFFFF')
			if (panel?.kind !== 'rect') throw new Error('no QR panel')
			const qr = items.find((i) => i.kind === 'qr')
			if (qr?.kind === 'qr') expect(qr.x).toBeGreaterThanOrEqual(panel.x)
			for (const item of items) {
				const e = extent(item)
				// The heading above the code is in the panel; everything else stays left of it.
				if (item.kind !== 'text' || !e || e.x0 >= panel.x) continue
				expect(e.x1, item.text).toBeLessThanOrEqual(panel.x)
			}
		})
	})

	it('leaves lines to write on in the Connect blanks, and fills them when given', () => {
		const blank = layoutCardFace('connect', box, EMPTY, measure).items
		expect(blank.filter((i) => i.kind === 'rule')).toHaveLength(2)
		expect(blank.some((i) => i.kind === 'text' && i.text === '@pauseai.info')).toBe(true)
		expect(blank.some((i) => i.kind === 'text' && i.text === ' area')).toBe(true)

		const filled = layoutCardFace('connect', box, FILLED, measure).items
		expect(filled.filter((i) => i.kind === 'rule')).toHaveLength(0)
		const texts = filled.flatMap((i) => (i.kind === 'text' ? [i.text] : []))
		expect(texts).toEqual(expect.arrayContaining(['joep', '@pauseai.info', 'Utrecht area']))
	})

	it('shrinks a long email on its own, not the whole Connect card', () => {
		const sizeOf = (values: Values, text: string) => {
			const item = layoutCardFace('connect', box, values, measure).items.find(
				(i) => i.kind === 'text' && i.text === text
			)
			return item?.kind === 'text' ? item.size : NaN
		}
		const long = { ...FILLED, email: LONG.email }
		expect(sizeOf(long, 'Email me at')).toBeCloseTo(sizeOf(FILLED, 'Email me at'))
		expect(sizeOf(long, '@pauseai.info')).toBeLessThan(sizeOf(FILLED, '@pauseai.info'))
	})

	it('breaks an email too long for one line before the @', () => {
		const { items } = layoutCardFace('connect', box, LONG, measure)
		const local = items.find((i) => i.kind === 'text' && LONG.email.startsWith(i.text + '@'))
		const domain = items.find((i) => i.kind === 'text' && i.text === '@pauseai.info')
		expect(local?.kind === 'text' && domain?.kind === 'text' && domain.y > local.y).toBe(true)
	})

	it('draws the QR code with the link it was given', () => {
		const { items } = layoutCardFace('connect', box, FILLED, measure)
		expect(items).toContainEqual(expect.objectContaining({ kind: 'qr', url: 'pauseai.info/join' }))
		// Big enough to scan easily: well over 2 cm.
		const qr = items.find((i) => i.kind === 'qr')
		expect(qr?.kind === 'qr' && qr.size / box.pxPerMm).toBeGreaterThan(30)
	})

	it('leaves the QR code out, and says so, when there is no link', () => {
		const { items, issues } = layoutCardFace('connect', box, { ...FILLED, qr: '' }, measure)
		expect(items.some((i) => i.kind === 'qr')).toBe(false)
		expect(issues.map((i) => i.id)).toContain('card-no-qr')
	})

	it('prints the name with the first name bold and the last name light', () => {
		const { items } = layoutCardFace('personal', box, FILLED, measure)
		expect(items).toContainEqual(expect.objectContaining({ text: 'Joep', font: 'display' }))
		expect(items).toContainEqual(
			expect.objectContaining({ text: 'Meindertsma', font: 'displayLight' })
		)
		expect(items).toContainEqual(
			expect.objectContaining({ text: 'joep@pauseai.info', font: 'bodyLight' })
		)
		expect(items.some((i) => i.kind === 'rule')).toBe(false)
	})

	it('prints lines for the name, title and email on a blank Personal card', () => {
		const { items } = layoutCardFace('personal', box, EMPTY, measure)
		expect(items.filter((i) => i.kind === 'rule')).toHaveLength(3)
		expect(items.some((i) => i.kind === 'text')).toBe(false)
	})

	it('breaks a long name onto two lines rather than shrinking it a long way', () => {
		const { items } = layoutCardFace('personal', box, LONG, measure)
		const first = items.find((i) => i.kind === 'text' && i.text === LONG.firstName)
		const last = items.find((i) => i.kind === 'text' && i.text === LONG.lastName)
		expect(first?.kind === 'text' && last?.kind === 'text' && last.y > first.y).toBe(true)
	})

	it('warns when text has to be squeezed', () => {
		const { issues } = layoutCardFace('connect', box, LONG, measure)
		expect(issues.some((i) => i.id.startsWith('card-long'))).toBe(true)
		expect(layoutCardFace('connect', box, FILLED, measure).issues).toEqual([])
		expect(layoutCardFace('personal', box, FILLED, measure).issues).toEqual([])
		expect(layoutCardFace('logo', box, FILLED, measure).issues).toEqual([])
	})

	it("doesn't squeeze text that fits, though browsers measure tiny text roughly", () => {
		// Like a browser's canvas, which measures text at a pixel or two narrower than it draws it.
		const rough: CardMeasure = (text, size, font) =>
			measure(text, size, font) * (size < 4 ? 0.8 : 1)
		for (const face of FACES) {
			const { items, issues } = layoutCardFace(face, box, FILLED, rough)
			expect(issues, face).toEqual([])
			expect(items.filter((i) => i.kind === 'text' && i.maxWidth !== undefined)).toEqual([])
		}
	})

	it('prints the slogan in capitals, a line each', () => {
		const { items } = layoutCardFace('logo', box, FILLED, measure)
		const texts = items.flatMap((i) => (i.kind === 'text' ? [i.text] : []))
		expect(texts).toEqual(['DON’T ALLOW COMPANIES', 'TO GAMBLE WITH OUR FUTURE'])
	})

	it('centres the logo when there is no slogan', () => {
		const { items } = layoutCardFace('logo', box, { ...FILLED, slogan: '' }, measure)
		const logo = items.find((i) => i.kind === 'logo')
		if (logo?.kind !== 'logo') throw new Error('no logo')
		expect(logo.y + logo.h / 2).toBeCloseTo(box.height / 2, 0)
	})

	it('lays the preview out the same way at a smaller scale', () => {
		const format = getCardFormat(formatId)
		const small = cardBox(format, renderSize(format, { bleed: false }), 0.5)
		const { items } = layoutCardFace('personal', small, FILLED, measure)
		const name = items.find((i) => i.kind === 'text' && i.text === 'Joep')
		expect(name?.kind === 'text' && name.x).toBeGreaterThanOrEqual(SAFE_MM * small.pxPerMm)
	})
})

describe('card fonts', () => {
	it.each(CARD_FONT_FACES)('$family $weight is a canvas font', ({ family, weight }) => {
		expect(CANVAS_FONTS).toContainEqual(
			expect.objectContaining({ family, weight, subset: 'latin' })
		)
	})
})

describe('parseCardSave', () => {
	it('starts afresh from nothing, or from a broken save', () => {
		const fresh = { designId: 'connect', formatId: 'card-eu', chapterId: '', edited: {} }
		expect(parseCardSave(null)).toEqual(fresh)
		expect(parseCardSave('{')).toEqual(fresh)
		expect(parseCardSave('[1]')).toEqual(fresh)
	})

	it('keeps known choices and typed text, and drops the rest', () => {
		const raw = JSON.stringify({
			designId: 'personal',
			formatId: 'card-us',
			chapterId: 'United Kingdom',
			edited: { firstName: 'Sam', email: 7, nonsense: 'x' }
		})
		expect(parseCardSave(raw)).toEqual({
			designId: 'personal',
			formatId: 'card-us',
			chapterId: 'United Kingdom',
			edited: { firstName: 'Sam' }
		})
		expect(
			parseCardSave(JSON.stringify({ designId: 'gone', chapterId: 'Atlantis' }))
		).toMatchObject({
			designId: 'connect',
			chapterId: ''
		})
	})
})
