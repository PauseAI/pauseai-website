/**
 * The PauseAI business card, after the PauseAI design Figma. Both sides are orange:
 *
 * - Side 1: the volunteer's name (first name bold) and title over a large faded pause mark, with the small logo.
 * - Side 2: the logo and "Email me at ___@pauseai.info to connect in the ___ area", beside a black "Join our global
 *   community" heading over a QR code to join.
 *
 * The email prints on side 2 only, in its sentence, so it never appears twice. Blank details print as lines, so a
 * stack of cards can be filled in by hand.
 *
 * The layout is worked out here without a canvas (text is measured through an injected function), so tests can check
 * that everything stays inside the crop-safe area whatever is typed. cardRender.ts paints it.
 */
import { getChapter, printableLink, type Chapter } from './chapters'
import { CARD_FORMATS, DEFAULT_CARD_FORMAT_ID, type PrintFormat, type RenderSize } from './formats'
import type { LintIssue } from './lint'
import { isQrLink, normaliseUrl, qrTarget, qrTooLong } from './qr'
import type { FieldDef, Values } from './templates'
import { BRAND_ORANGE, INK, LOGO_ASPECT } from './themes'

/** Crop-safe margin inside the trim. Text, logos and QR codes stay inside it, as cutting can wander this far. */
export const SAFE_MM = 3

/** Smallest text on a card, in points. Long details shrink to this, then are squeezed, never smaller. */
export const MIN_CARD_PT = 7

const PT_TO_MM = 25.4 / 72

/** The Figma frames are 490 × 280 px (3.5 × 2 in), so positions there are read as 280ths of the card's height. */
const FIGMA_W = 490
const FIGMA_H = 280

/** `name` is side 1 (name and title), `connect` side 2 (email, area and QR code). */
export type CardFace = 'name' | 'connect'

/** The card's sides, in print order. */
export const CARD_SIDES: { face: CardFace; label: string }[] = [
	{ face: 'name', label: 'Side 1' },
	{ face: 'connect', label: 'Side 2' }
]

const PAUSEAI_EMAIL_DOMAIN = '@pauseai.info'

const BLANK_HINT = 'Leave blank to print a line to write on.'

export const CARD_FIELDS: FieldDef[] = [
	{
		key: 'firstName',
		label: 'First name',
		kind: 'text',
		maxLength: 30,
		hint: BLANK_HINT,
		default: ''
	},
	{ key: 'lastName', label: 'Last name', kind: 'text', maxLength: 40, default: '' },
	{
		key: 'title',
		label: 'Title or role',
		kind: 'text',
		maxLength: 60,
		hint: 'Optional, e.g. Volunteer. A card with no name or title prints a line for each.',
		default: ''
	},
	{
		key: 'email',
		label: 'Email',
		kind: 'text',
		maxLength: 60,
		hint: `The part before ${PAUSEAI_EMAIL_DOMAIN} is enough. ${BLANK_HINT}`,
		default: ''
	},
	{
		key: 'area',
		label: 'Area',
		kind: 'text',
		maxLength: 40,
		hint: `As in "to connect in the London area". ${BLANK_HINT}`,
		default: ''
	},
	{
		key: 'qrHeading',
		label: 'Above the QR code',
		kind: 'text',
		maxLength: 40,
		default: 'Join our global community'
	},
	{ key: 'qr', label: 'QR code link', kind: 'text', maxLength: 200, default: '' }
]

/** Every card field's default for `chapter`: the QR code opens the chapter's link, as on the other designs. */
export function cardDefaults(chapter: Chapter): Values {
	return Object.fromEntries(
		CARD_FIELDS.map((f) => [f.key, f.key === 'qr' ? printableLink(chapter) : f.default])
	)
}

/** What the business card tool keeps in the browser between visits: only what the volunteer chose or typed. */
export interface CardSave {
	formatId: string
	chapterId: string
	/** Typed values only; the rest come from cardDefaults, so a change of country still updates the QR link. */
	edited: Values
}

/** Reads a saved CardSave, dropping anything unknown or malformed. */
export function parseCardSave(raw: string | null): CardSave {
	let data: unknown = null
	try {
		data = raw ? JSON.parse(raw) : null
	} catch {
		// A broken save starts afresh.
	}
	const o = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
	const known = (v: unknown, ids: string[], fallback: string) =>
		typeof v === 'string' && ids.includes(v) ? v : fallback
	const edited =
		o.edited && typeof o.edited === 'object'
			? Object.fromEntries(
					Object.entries(o.edited).filter(
						([k, v]) => typeof v === 'string' && CARD_FIELDS.some((f) => f.key === k)
					) as [string, string][]
				)
			: {}
	return {
		formatId: known(
			o.formatId,
			CARD_FORMATS.map((f) => f.id),
			DEFAULT_CARD_FORMAT_ID
		),
		chapterId: typeof o.chapterId === 'string' ? getChapter(o.chapterId).id : '',
		edited
	}
}

/**
 * An email split for printing: what goes before the @ (empty prints a line to write on) and the rest. Just a name
 * ("joep") is taken to be a PauseAI address.
 */
export function emailParts(email: string): { local: string; domain: string } {
	const trimmed = email.trim()
	const at = trimmed.indexOf('@')
	if (at < 0) return { local: trimmed, domain: PAUSEAI_EMAIL_DOMAIN }
	return { local: trimmed.slice(0, at), domain: trimmed.slice(at) }
}

// ---------------------------------------------------------------------------
// Layout

/** Saira Condensed bold (headings, the first name), Saira Condensed light (the last name), Roboto Slab light. */
export type CardFont = 'display' | 'displayLight' | 'bodyLight'

/** Width of `text` at `size` px in `font`. */
export type CardMeasure = (text: string, size: number, font: CardFont) => number

/** Rough ascent and descent as shares of the font size, for keeping lines inside the safe area. */
export const TEXT_ASCENT = 0.78
export const TEXT_DESCENT = 0.24

export type CardItem =
	| { kind: 'rect'; x: number; y: number; w: number; h: number; fill: string }
	/** A line to write on. */
	| { kind: 'rule'; x: number; y: number; w: number; h: number; fill: string }
	/** Left-aligned text on an alphabetic baseline. `maxWidth` squeezes text that is still too long at the smallest size. */
	| {
			kind: 'text'
			text: string
			x: number
			y: number
			size: number
			font: CardFont
			fill: string
			maxWidth?: number
	  }
	/** The logo for orange: white circle, black PAUSE. */
	| { kind: 'logo'; x: number; y: number; w: number; h: number }
	| { kind: 'qr'; url: string; x: number; y: number; size: number }
	/** The big faded pause mark: a circle with the two bars cut out. */
	| {
			kind: 'mark'
			cx: number
			cy: number
			r: number
			barW: number
			barH: number
			barGap: number
			fill: string
			alpha: number
	  }

export interface CardLayout {
	items: CardItem[]
	issues: LintIssue[]
}

/** The canvas a face is drawn on: its size in px, including bleed on each edge, and its px per mm. */
export interface CardBox {
	width: number
	height: number
	bleedPx: number
	pxPerMm: number
}

/** The box for a print render of `format`, scaled by `scale` (below 1 for the live preview). */
export function cardBox(format: PrintFormat, size: RenderSize, scale = 1): CardBox {
	const width = Math.max(1, Math.round(size.width * scale))
	const height = Math.max(1, Math.round(size.height * scale))
	const bleedPx = Math.round(size.bleedPx * scale)
	return { width, height, bleedPx, pxPerMm: (height - 2 * bleedPx) / format.heightMm }
}

interface Frame {
	box: CardBox
	/** Trim edges. */
	left: number
	top: number
	right: number
	bottom: number
	/** Crop-safe edges. */
	safe: { left: number; top: number; right: number; bottom: number }
	/** One Figma px at this size. */
	s: number
	minFont: number
	m: CardMeasure
	issues: LintIssue[]
}

function frame(box: CardBox, m: CardMeasure): Frame {
	const left = box.bleedPx
	const top = box.bleedPx
	const right = box.width - box.bleedPx
	const bottom = box.height - box.bleedPx
	const inset = SAFE_MM * box.pxPerMm
	return {
		box,
		left,
		top,
		right,
		bottom,
		safe: { left: left + inset, top: top + inset, right: right - inset, bottom: bottom - inset },
		s: (bottom - top) / FIGMA_H,
		minFont: MIN_CARD_PT * PT_TO_MM * box.pxPerMm,
		m,
		issues: []
	}
}

const WHITE = '#FFFFFF'

/** Card faces are laid out for a 490 × 280 card and adapt to the shorter UK/EU width. */
export function layoutCardFace(
	face: CardFace,
	box: CardBox,
	values: Values,
	measure: CardMeasure
): CardLayout {
	const f = frame(box, measure)
	const items = face === 'connect' ? layoutConnect(f, values) : layoutName(f, values)
	return { items, issues: f.issues }
}

function tooLong(f: Frame, what: string) {
	f.issues.push({
		id: `card-long-${what.toLowerCase().replace(/\W+/g, '-')}`,
		level: 'warn',
		message: `The ${what} is too long to print at a readable size, so it is squeezed. Shorten it if you can.`
	})
}

/** A piece of a line: text, or a line to write on of width `blank` (at size 1). */
type Segment = { text: string; font: CardFont; fill: string } | { blank: number; fill: string }

function segmentWidth(f: Frame, seg: Segment, size: number): number {
	return 'blank' in seg ? seg.blank * size : f.m(seg.text, size, seg.font)
}

function lineWidth(f: Frame, line: Segment[], size: number): number {
	return line.reduce((w, seg) => w + segmentWidth(f, seg, size), 0)
}

/** Largest size, up to `max`, at which every line fits `maxWidth`. Not below the smallest card text. */
function fitLines(f: Frame, lines: Segment[][], maxWidth: number, max: number): number {
	// Measured at the largest size, as a browser measures text at tiny sizes (1 px) only roughly.
	const widest = Math.max(...lines.map((l) => lineWidth(f, l, max)), 0)
	// A little slack when the width decides, as text measures a touch differently at each size.
	const size = widest > maxWidth ? ((max * maxWidth) / widest) * 0.98 : max
	return Math.max(f.minFont, size)
}

/** Whether `line` is noticeably wider than `maxWidth` at `size`, so it will be squeezed. */
function overflows(f: Frame, line: Segment[], size: number, maxWidth: number): boolean {
	return lineWidth(f, line, size) > maxWidth * 1.01
}

/** Emits the segments of `line` from `x`, squeezing the text if the line is still too wide. */
function emitLine(
	f: Frame,
	items: CardItem[],
	line: Segment[],
	x: number,
	baseline: number,
	size: number,
	maxWidth: number
) {
	const natural = lineWidth(f, line, size)
	const squeeze = natural > maxWidth ? maxWidth / natural : 1
	let cx = x
	for (const seg of line) {
		const w = segmentWidth(f, seg, size) * squeeze
		if ('blank' in seg) {
			const h = Math.max(1, size * 0.08)
			items.push({ kind: 'rule', x: cx, y: baseline + size * 0.06, w, h, fill: seg.fill })
		} else {
			items.push({
				kind: 'text',
				text: seg.text,
				x: cx,
				y: baseline,
				size,
				font: seg.font,
				fill: seg.fill,
				...(squeeze < 1 ? { maxWidth: w } : {})
			})
		}
		cx += w
	}
}

// Figma: the blank before "@pauseai.info" and before "area" is 82 px wide at 24 px text.
const BLANK_EM = 82 / 24

/** The orange side of Connect: logo and "Email me at…" on the left, a black heading over the QR code on the right. */
function layoutConnect(f: Frame, values: Values): CardItem[] {
	const { s, safe, box } = f
	const items: CardItem[] = []
	const trimW = f.right - f.left
	// The QR panel takes the same share of the width as in Figma, so the text keeps its room on the narrower card.
	const panelX = f.right - (trimW * 239) / FIGMA_W
	items.push({ kind: 'rect', x: 0, y: 0, w: box.width, h: box.height, fill: BRAND_ORANGE })
	items.push({ kind: 'rect', x: panelX, y: 0, w: box.width - panelX, h: box.height, fill: WHITE })

	// Heading band, tall enough that its text sits inside the safe area.
	const headerBottom = f.top + Math.max(47 * s, safe.top - f.top + 28 * s)
	items.push({ kind: 'rect', x: panelX, y: 0, w: box.width - panelX, h: headerBottom, fill: INK })
	const heading = values.qrHeading?.trim() ?? ''
	if (heading) {
		const headingLeft = panelX + 10 * s
		const room = safe.right - headingLeft
		const line: Segment[] = [{ text: heading, font: 'display', fill: WHITE }]
		const size = Math.min(fitLines(f, [line], room, 24 * s), (headerBottom - safe.top) / 1.05)
		if (overflows(f, line, size, room)) tooLong(f, 'heading above the QR code')
		const w = Math.min(room, lineWidth(f, line, size))
		const mid = (safe.top + headerBottom) / 2
		const baseline = mid + (size * (TEXT_ASCENT - TEXT_DESCENT)) / 2
		emitLine(f, items, line, headingLeft + (room - w) / 2, baseline, size, room)
	}

	const qr = values.qr?.trim() ?? ''
	if (qr && normaliseUrl(qr)) {
		if (!isQrLink(qr)) {
			f.issues.push({
				id: 'card-qr-link',
				level: 'warn',
				message: `"${qr}" doesn't look like a web address, so the QR code may go nowhere.`
			})
		} else if (qrTooLong(qrTarget(qr, false))) {
			f.issues.push({
				id: 'card-qr-long',
				level: 'warn',
				message: 'The QR code link is too long to scan reliably. Use a shorter link.'
			})
		}
		const areaLeft = panelX + 10 * s
		const areaTop = headerBottom + 10 * s
		const size = Math.min(safe.right - areaLeft, safe.bottom - areaTop)
		items.push({
			kind: 'qr',
			url: qr,
			x: areaLeft + (safe.right - areaLeft - size) / 2,
			y: areaTop + (safe.bottom - areaTop - size) / 2,
			size
		})
	} else {
		f.issues.push({
			id: 'card-no-qr',
			level: 'warn',
			message: 'There is no QR code link, so the QR code is left out.'
		})
	}

	// Left side: everything centred a touch right of the orange's middle, as in Figma.
	const cx = (f.left + panelX) / 2 + 4 * s
	const half = Math.min(cx - safe.left, panelX - 10 * s - cx)
	const maxWidth = 2 * half

	const logoW = Math.min(178 * s, maxWidth)
	const logoH = logoW / LOGO_ASPECT
	const logoY = Math.max(safe.top, f.top + 23 * s)
	items.push({ kind: 'logo', x: cx - logoW / 2, y: logoY, w: logoW, h: logoH })

	const text = (t: string, fill = WHITE): Segment => ({ text: t, font: 'display', fill })
	const { local, domain } = emailParts(values.email ?? '')
	const area = values.area?.trim() ?? ''
	// The email line is ink, the rest white, as in Figma.
	const localSeg: Segment = local ? text(local, INK) : { blank: BLANK_EM, fill: INK }
	const domainSeg = text(domain, INK)
	// Each detail prints on one line, or breaks before the @ (or before "area") when that keeps it much bigger.
	const emailChoices: Segment[][][] = local
		? [[[localSeg, domainSeg]], [[localSeg], [domainSeg]]]
		: [[[localSeg, domainSeg]]]
	const areaChoices: Segment[][][] = area
		? [[[text(`${area} area`)]], [[text(area)], [text('area')]]]
		: [[[{ blank: BLANK_EM, fill: WHITE }, text(' area')]]]
	const fixed: Segment[][] = [[text('Email me at')], [text('to connect in the')]]

	const top = logoY + logoH + 8 * s
	const room = safe.bottom - top
	const LINE = 1.5
	// How big a choice prints, counting any squeeze of a line still too wide at the smallest size.
	const shown = (lines: Segment[][], size: number) =>
		size * Math.min(1, ...lines.map((l) => maxWidth / lineWidth(f, l, size)))
	const pick = (choices: Segment[][][], max: number) => {
		const [one, broken] = choices.map((lines) => ({
			lines,
			size: fitLines(f, lines, maxWidth, max)
		}))
		return broken &&
			one.size < max * 0.8 &&
			shown(broken.lines, broken.size) > shown(one.lines, one.size)
			? broken
			: one
	}
	// Figma's 24 px, or smaller where the fixed lines or the card's height need it. Long details then shrink on their
	// own, so one long address doesn't make the whole card small.
	let base = fitLines(f, fixed, maxWidth, 24 * s)
	let email = pick(emailChoices, base)
	let areaPick = pick(areaChoices, base)
	for (let i = 0; i < 3; i++) {
		const rows = fixed.length + email.lines.length + areaPick.lines.length
		if (rows * base * LINE <= room) break
		base = Math.max(f.minFont, room / (rows * LINE))
		email = pick(emailChoices, base)
		areaPick = pick(areaChoices, base)
	}
	const rows: { line: Segment[]; size: number }[] = [
		{ line: fixed[0], size: base },
		...email.lines.map((line) => ({ line, size: email.size })),
		{ line: fixed[1], size: base },
		...areaPick.lines.map((line) => ({ line, size: areaPick.size }))
	]
	if (rows.some((r) => overflows(f, r.line, r.size, maxWidth))) tooLong(f, 'email or area')

	const lh = base * LINE
	const blockH = rows.length * lh
	// Centred between the logo and the card's bottom edge, as in Figma, but kept inside the safe area.
	const centre = (logoY + logoH + f.bottom) / 2
	const blockTop = Math.min(Math.max(top, centre - blockH / 2), safe.bottom - blockH)
	rows.forEach(({ line, size }, i) => {
		const w = Math.min(maxWidth, lineWidth(f, line, size))
		const baseline = blockTop + i * lh + lh / 2 + (size * (TEXT_ASCENT - TEXT_DESCENT)) / 2
		emitLine(f, items, line, cx - w / 2, baseline, size, maxWidth)
	})
	return items
}

/** Side 1: the faded pause mark, name and title, and the small logo. */
function layoutName(f: Frame, values: Values): CardItem[] {
	const { s, safe, box } = f
	const items: CardItem[] = [
		{ kind: 'rect', x: 0, y: 0, w: box.width, h: box.height, fill: BRAND_ORANGE },
		// Anchored to the right edge, so it crops the same way on both card widths.
		{
			kind: 'mark',
			cx: f.right - 101 * s,
			cy: f.top + 115 * s,
			r: 195.5 * s,
			barW: 48.5 * s,
			barH: 173 * s,
			barGap: 44 * s,
			fill: WHITE,
			alpha: 0.2
		}
	]

	const x = Math.max(safe.left, f.left + 47 * s)
	const maxWidth = safe.right - x

	const logoH = 28.7 * s
	const logoW = logoH * LOGO_ASPECT
	const logoY = Math.min(f.top + 226.8 * s, safe.bottom - logoH)
	items.push({ kind: 'logo', x, y: logoY, w: logoW, h: logoH })

	const first = values.firstName?.trim() ?? ''
	const last = values.lastName?.trim() ?? ''
	const title = values.title?.trim() ?? ''
	const blankCard = !first && !last && !title

	const nameMax = 46 * s
	const infoMax = 20 * s
	const anchor = logoY - 31 * s

	if (blankCard) {
		// Lines to write the name and title on, where the text would be.
		const rule = (baseline: number, w: number) =>
			items.push({ kind: 'rule', x, y: baseline, w, h: Math.max(1, 1.6 * s), fill: WHITE })
		rule(anchor, maxWidth * 0.7)
		rule(anchor - infoMax * 1.6 - 20 * s, maxWidth * 0.85)
		return items
	}

	// The title, just above the logo. It is optional, so a blank one is left out; a blank name prints a line (below).
	// The email is on side 2 only, in its sentence, so it never prints twice.
	const info: Segment[][] = title ? [[{ text: title, font: 'bodyLight', fill: WHITE }]] : []
	let infoSize = fitLines(f, info, maxWidth, infoMax)
	// A long title wraps onto a second line before it shrinks a long way.
	if (title && infoSize < infoMax * 0.8) {
		const words = title.split(/\s+/)
		const mid = Math.ceil(words.length / 2)
		if (words.length > 1) {
			const wrapped = [
				[{ text: words.slice(0, mid).join(' '), font: 'bodyLight', fill: WHITE }],
				[{ text: words.slice(mid).join(' '), font: 'bodyLight', fill: WHITE }]
			] as Segment[][]
			const wrappedSize = fitLines(f, wrapped, maxWidth, infoMax)
			if (wrappedSize > infoSize) {
				info.splice(0, 1, ...wrapped)
				infoSize = wrappedSize
			}
		}
	}
	if (info.some((l) => overflows(f, l, infoSize, maxWidth))) tooLong(f, 'title')
	const infoLh = infoSize * 1.35
	const infoTop = anchor - (info.length - 1) * infoLh
	info.forEach((line, i) => emitLine(f, items, line, x, infoTop + i * infoLh, infoSize, maxWidth))

	// The name: first name bold, last name light, on one line, or two when that would shrink it a long way.
	{
		const firstSeg: Segment = { text: first, font: 'display', fill: WHITE }
		const lastSeg: Segment = { text: last, font: 'displayLight', fill: WHITE }
		const oneLine: Segment[][] = [
			first && last
				? [firstSeg, { text: ' ', font: 'displayLight', fill: WHITE }, lastSeg]
				: first || last
					? [first ? firstSeg : lastSeg]
					: [{ blank: 5, fill: WHITE }]
		]
		const twoLines: Segment[][] = [[firstSeg], [lastSeg]]
		const nameBottom = info.length
			? infoTop - infoSize * TEXT_ASCENT - 12 * s
			: anchor + nameMax * TEXT_DESCENT
		const fitName = (lines: Segment[][]) => {
			const byWidth = fitLines(f, lines, maxWidth, nameMax)
			const byHeight = (nameBottom - safe.top) / (lines.length * 1.05)
			return Math.max(f.minFont, Math.min(byWidth, byHeight))
		}
		let lines = oneLine
		let size = fitName(oneLine)
		if (first && last && size < nameMax * 0.75) {
			const twoSize = fitName(twoLines)
			if (twoSize > size) {
				lines = twoLines
				size = twoSize
			}
		}
		if (lines.some((l) => overflows(f, l, size, maxWidth))) tooLong(f, 'name')
		const lh = size * 1.05
		const lastBaseline = nameBottom - size * TEXT_DESCENT
		lines.forEach((line, i) =>
			emitLine(f, items, line, x, lastBaseline - (lines.length - 1 - i) * lh, size, maxWidth)
		)
	}
	return items
}
