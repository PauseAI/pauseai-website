import { hexToRgb } from './contrast'
import type { QrSize } from './design'
import {
	EVENTS_PAGE_URL,
	exampleEventDate,
	formatPickedDate,
	formatPickedTimeRange
} from './eventText'
import { aspectClass, layoutMarginUnits, type AspectClass } from './formats'
import { isLumaEventLink, type LintCollector } from './lint'
import { normaliseUrl, QR_GAP_UNITS, qrPlan, qrTarget, usableQrCodes, type QrCode } from './qr'
import { pauseBars, QR_INK, qrShape } from './qrShape'
import { BODY_FAMILY, HEADLINE_FAMILY } from './canvasFonts'
import { BRAND_ORANGE, CREAM, LOGO_ASPECT, type Theme } from './themes'
import { coverRect, fitText, type FitResult, type Measure } from './text'

/** Headlines in the site's heading face, body text in its body face (see canvasFonts.ts). */
// Saira Condensed has no Cyrillic or Greek letters, so those come from Roboto Slab, which has.
const DISPLAY_FONT = `"${HEADLINE_FAMILY}", "${BODY_FAMILY}", "Saira Condensed", Impact, sans-serif`
const BODY_FONT = `"${BODY_FAMILY}", "Roboto Slab", Georgia, serif`
/** The faces the layouts draw with, for loading before drawing. */
export const FONT_FACES: { family: string; weight: string }[] = [
	{ family: HEADLINE_FAMILY, weight: '700' },
	{ family: BODY_FAMILY, weight: '500' },
	{ family: BODY_FAMILY, weight: '600' },
	{ family: BODY_FAMILY, weight: '700' },
	{ family: BODY_FAMILY, weight: '800' }
]

export type Values = Record<string, string>

export interface Drawable {
	source: CanvasImageSource
	width: number
	height: number
}

export interface PhotoSettings {
	zoom: number
	focalX: number
	focalY: number
	/** 0..1, how much of the photo shows through the theme tint (see PHOTO_TINTS). */
	visible: number
}

export interface DrawArgs {
	ctx: CanvasRenderingContext2D
	width: number
	height: number
	/** Bleed on each edge in px. Backgrounds fill it, content stays out of it. */
	bleedPx: number
	/** Share of the trim width, from the left, to keep clear below the header. See DigitalFormat.safeLeft. */
	safeLeft?: number
	/** Canvas px per export px: 1 for downloads, below 1 for the live preview. */
	scale: number
	/** Print resolution at export size. Undefined for digital formats. */
	dpi?: number
	theme: Theme
	values: Values
	/** The country a design is for, as its header shows it ("UK", "Deutschland"). Empty for PauseAI as a whole. */
	country?: string
	logo: Drawable
	photo: Drawable | null
	photoSettings: PhotoSettings
	/** QR codes to draw in the footer, in order. Empty rows are ignored. */
	qrCodes: QrCode[]
	/** Whether QR links get an analytics tag. */
	trackQr: boolean
	/** Preferred QR size. Medium when left out. */
	qrSize?: QrSize
	/** Multiplier on the title's automatic size range, from the title size nudge. 1 when left out. */
	headlineScale?: number
	/** Partner logos, drawn to the right of the PauseAI logo. */
	partnerLogos?: Drawable[]
	/** Collects problems for the checks list. Only the live preview passes one. */
	lint?: LintCollector
}

export interface FieldDef {
	key: string
	label: string
	/** "date" and "time" hold what date and time inputs give ("2026-10-28", "18:30") and are formatted when drawn. */
	kind: 'text' | 'textarea' | 'toggle' | 'date' | 'time'
	maxLength?: number
	hint?: string
	default: string
}

export interface Template {
	id: string
	label: string
	description: string
	fields: FieldDef[]
	draw: (args: DrawArgs) => void
}

// ---------------------------------------------------------------------------
// Shared drawing helpers

interface Geometry {
	/** Design unit: 1 at 1000px on a side, scales with the trim area. */
	u: number
	cls: AspectClass
	/** Left edge of the logo. Only differs from `left` when the format keeps a safe area clear below the header. */
	headerLeft: number
	left: number
	right: number
	top: number
	bottom: number
	cw: number
	logoW: number
}

function geometry(a: DrawArgs): Geometry {
	const trimW = a.width - 2 * a.bleedPx
	const trimH = a.height - 2 * a.bleedPx
	const cls = aspectClass(trimW, trimH)
	const u = Math.sqrt(trimW * trimH) / 1000
	const marginUnits = layoutMarginUnits(cls)
	const m = a.bleedPx + marginUnits * u
	const logoUnits = cls === 'banner' ? 230 : cls === 'story' ? 340 : 300
	const left = a.safeLeft ? Math.max(m, a.bleedPx + trimW * a.safeLeft) : m
	const right = a.width - m
	return {
		u,
		cls,
		headerLeft: m,
		left,
		right,
		top: m,
		bottom: a.height - m,
		cw: right - left,
		logoW: logoUnits * u
	}
}

/** The small-text colours to use: the style's own, or its darker on-photo ones when a photo is behind the text. */
function smallTextColours(a: DrawArgs): { muted: string; accentText: string } {
	const onPhoto = a.photo ? a.theme.onPhoto : undefined
	return {
		muted: onPhoto?.muted ?? a.theme.muted,
		accentText: onPhoto?.accentText ?? a.theme.accentText
	}
}

/**
 * Text over a photo gets a soft halo in the style's own colour, so it blends into the tint rather than reading as
 * an outline, and lifts the text off busy or bright patches. Blur is a share of the font size.
 */
const HALO_BLUR = 0.35
const HALO_ALPHA = 0.85
/**
 * How much extra style colour the halo puts behind a line, for the contrast check. Deliberately below what the
 * halo gives right around the letters, since the check measures the line's whole box.
 */
const HALO_COVERAGE = 0.3

/** fillText, noting the text for the checks. Uses the context's current font and fill. */
function fillText(a: DrawArgs, text: string, x: number, y: number, maxWidth?: number) {
	const { ctx } = a
	const size = parseFloat(/([\d.]+)px/.exec(ctx.font)?.[1] ?? '0')
	if (a.lint) noteTextForLint(a, a.lint, text, x, y, size, maxWidth)
	const halo = a.photo ? hexToRgb(a.theme.bg) : null
	if (halo) {
		ctx.save()
		ctx.shadowColor = `rgba(${halo.join(', ')}, ${HALO_ALPHA})`
		ctx.shadowBlur = size * HALO_BLUR
	}
	if (maxWidth === undefined) ctx.fillText(text, x, y)
	else ctx.fillText(text, x, y, maxWidth)
	if (halo) ctx.restore()
}

/** Text this size or larger, in design units, counts as large for contrast (3:1 rather than 4.5:1). */
const LARGE_TEXT_UNITS = 40

/** Records a line's size for the print check and its box and colour for the contrast check. */
function noteTextForLint(
	a: DrawArgs,
	lint: LintCollector,
	text: string,
	x: number,
	y: number,
	size: number,
	maxWidth?: number
) {
	lint.noteText(size / a.scale)
	if (!a.photo) return
	const { ctx } = a
	const m = ctx.measureText(text)
	const inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight
	// A maxWidth narrower than the text squeezes it horizontally around the same anchor.
	const squeeze = maxWidth !== undefined && inkW > maxWidth ? maxWidth / inkW : 1
	const rect = {
		x: x - m.actualBoundingBoxLeft * squeeze,
		y: y - m.actualBoundingBoxAscent,
		w: inkW * squeeze,
		h: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent
	}
	const u = Math.sqrt(a.width * a.height) / 1000
	lint.noteTextBox(
		text,
		rect,
		hexToRgb(typeof ctx.fillStyle === 'string' ? ctx.fillStyle : ''),
		size >= LARGE_TEXT_UNITS * u,
		HALO_COVERAGE
	)
}

function font(weight: number | string, size: number, family: string): string {
	return `${weight} ${size}px ${family}`
}

function measurer(ctx: CanvasRenderingContext2D, weight: number | string, family: string): Measure {
	return (text, size) => {
		ctx.font = font(weight, size, family)
		return ctx.measureText(text).width
	}
}

function setTracking(ctx: CanvasRenderingContext2D, px: number) {
	;(ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${px}px`
}

function paintBackground(a: DrawArgs) {
	const { ctx, width, height, theme, photo, photoSettings } = a
	ctx.fillStyle = theme.bg
	ctx.fillRect(0, 0, width, height)
	if (!photo) return
	const r = coverRect(
		photo.width,
		photo.height,
		width,
		height,
		photoSettings.zoom,
		photoSettings.focalX,
		photoSettings.focalY
	)
	ctx.drawImage(photo.source, r.x, r.y, r.w, r.h)
	a.lint?.captureBackdrop(ctx.canvas, {
		bg: hexToRgb(theme.bg) ?? [255, 255, 255],
		visible: photoSettings.visible
	})
	if (photoSettings.visible >= 1) return
	ctx.globalAlpha = 1 - photoSettings.visible
	ctx.fillStyle = theme.bg
	ctx.fillRect(0, 0, width, height)
	ctx.globalAlpha = 1
}

/**
 * Logo top-left with any partner logos beside it, "COUNTRY · GROUP" top-right, either part left out when blank.
 * Returns the y of the header's bottom edge.
 */
function drawHeader(a: DrawArgs, g: Geometry): number {
	const { ctx, values } = a
	const logoH = g.logoW / LOGO_ASPECT
	ctx.drawImage(a.logo.source, g.headerLeft, g.top, g.logoW, logoH)

	const label = [a.country, values.group]
		.map((part) => part?.trim())
		.filter(Boolean)
		.join(' · ')
		.toUpperCase()
	if (!label) {
		// No label: partner logos get the whole row.
		drawPartnerLogos(a, g, logoH, g.right)
		return g.top + logoH
	}
	const size = (g.cls === 'banner' ? 24 : 28) * g.u
	ctx.save()
	ctx.font = font(800, size, BODY_FONT)
	setTracking(ctx, size * 0.14)
	const labelLeft = g.right - ctx.measureText(label).width
	ctx.restore()
	drawPartnerLogos(a, g, logoH, labelLeft - 30 * g.u)

	ctx.save()
	ctx.font = font(800, size, BODY_FONT)
	setTracking(ctx, size * 0.14)
	ctx.fillStyle = smallTextColours(a).accentText
	ctx.textAlign = 'right'
	ctx.textBaseline = 'middle'
	// Tracking adds trailing space after the last glyph, so nudge back to the margin.
	fillText(a, label, g.right + size * 0.14, g.top + logoH / 2)
	ctx.restore()
	return g.top + logoH
}

/** Longest title that still reads at Luma's ~280px on a logo cover. Longer ones are flagged, not cut. */
export const LOGO_COVER_TITLE_CHARS = 20

/** Share of the width the logo spans on a logo cover (see DigitalFormat.logoCover). */
const LOGO_COVER_WIDTH = 1 / 2

/** Where a logo cover puts the logo: bottom-left, inside the usual margin, spanning LOGO_COVER_WIDTH of the width. */
function logoCoverRect(
	width: number,
	height: number
): { x: number; y: number; w: number; h: number } {
	const cls = aspectClass(width, height)
	const m = layoutMarginUnits(cls) * (Math.sqrt(width * height) / 1000)
	const w = width * LOGO_COVER_WIDTH
	const h = w / LOGO_ASPECT
	return { x: m, y: height - m - h, w, h }
}

/** A soft dark shadow, so light lettering holds up on a bright or busy patch of an untinted photo. */
function darkShadow(ctx: CanvasRenderingContext2D, size: number) {
	ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
	ctx.shadowBlur = size * 0.18
	ctx.shadowOffsetY = size * 0.03
}

/**
 * A logo cover: the photo and the logo, and the title above the logo when `title` is given. Over an untinted photo
 * both are light, with a dark shadow; over a tinted one the title takes the style's text colour.
 */
export function drawLogoCover(a: DrawArgs, title = '') {
	paintBackground(a)
	const { ctx } = a
	const clear = !!a.photo && a.photoSettings.visible >= 1
	const r = logoCoverRect(a.width, a.height)
	ctx.save()
	if (clear) darkShadow(ctx, r.h)
	ctx.drawImage(a.logo.source, r.x, r.y, r.w, r.h)
	ctx.restore()

	if (!title.trim()) return
	const length = title.trim().length
	if (length > LOGO_COVER_TITLE_CHARS) {
		a.lint?.add({
			id: 'cover-title-long',
			level: 'info',
			message: `On the Luma cover, a title of ${LOGO_COVER_TITLE_CHARS} characters or fewer reads best. This one is ${length}.`
		})
	}
	const u = Math.sqrt(a.width * a.height) / 1000
	const gap = 36 * u
	const fit = fitText(measurer(ctx, 700, DISPLAY_FONT), title, {
		maxWidth: a.width - 2 * r.x,
		maxHeight: Math.max(0, r.y - gap - r.x),
		maxFont: 130 * u,
		minFont: 56 * u,
		lineHeight: 1.02
	})
	const y = r.y - gap - fit.height
	ctx.save()
	ctx.font = font(700, fit.fontSize, DISPLAY_FONT)
	if (clear) {
		// Drawn directly rather than through fillText, whose halo is in the style's colour, for a tinted photo.
		ctx.fillStyle = CREAM
		ctx.textAlign = 'left'
		ctx.textBaseline = 'top'
		darkShadow(ctx, fit.fontSize)
		fit.lines.forEach((line, i) => ctx.fillText(line, r.x, y + i * fit.lineHeightPx))
	} else {
		ctx.fillStyle = a.theme.text
		drawLines(a, fit.lines, r.x, y, fit.lineHeightPx)
	}
	ctx.restore()
}

/** Partner logos may shrink to this share of the PauseAI logo's height before one is left out. */
const MIN_PARTNER_SCALE = 0.6

/**
 * Partner logos to the right of the PauseAI logo, each after a thin divider, at the PauseAI logo's height.
 * They shrink to fit before `limitRight` (the group label), and any that still do not fit are left out.
 */
function drawPartnerLogos(a: DrawArgs, g: Geometry, logoH: number, limitRight: number) {
	const logos = a.partnerLogos ?? []
	if (logos.length === 0) return
	const { ctx, theme } = a
	const gap = 26 * g.u
	const rule = Math.max(1, 3 * g.u)
	const start = g.headerLeft + g.logoW
	// A very wide logo is capped, so it cannot dominate the PauseAI one.
	const widths = logos.map((l) => Math.min((logoH * l.width) / l.height, g.logoW))
	const fixed = (n: number) => n * (2 * gap + rule)

	let shown = logos.length
	let k = 1
	for (; shown > 0; shown--) {
		const room = limitRight - start - fixed(shown)
		const need = widths.slice(0, shown).reduce((s, w) => s + w, 0)
		k = Math.min(1, room / need)
		if (k >= MIN_PARTNER_SCALE) break
	}
	if (shown < logos.length) {
		a.lint?.add({
			id: 'partner-logo-dropped',
			level: 'warn',
			message:
				shown === 0
					? 'The partner logo does not fit on this format, so it is left out.'
					: 'Not every partner logo fits on this format, so the last one is left out.'
		})
	}

	let x = start
	for (let i = 0; i < shown; i++) {
		const w = widths[i] * k
		const h = (w * logos[i].height) / logos[i].width
		x += gap
		ctx.save()
		ctx.globalAlpha = 0.35
		ctx.fillStyle = theme.text
		ctx.fillRect(x, g.top + logoH * 0.1, rule, logoH * 0.8)
		ctx.restore()
		x += rule + gap
		ctx.drawImage(logos[i].source, x, g.top + (logoH - h) / 2, w, h)
		x += w
	}
}

function roundRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number
) {
	ctx.beginPath()
	ctx.moveTo(x + r, y)
	ctx.arcTo(x + w, y, x + w, y + h, r)
	ctx.arcTo(x + w, y + h, x, y + h, r)
	ctx.arcTo(x, y + h, x, y, r)
	ctx.arcTo(x, y, x + w, y, r)
	ctx.closePath()
}

/** Scannable QR on a light panel: round dots, ring-and-square corner marks, the pause symbol in the middle. */
function drawQr(a: DrawArgs, target: string, x: number, y: number, size: number) {
	const { ctx } = a
	const shape = qrShape(target, size, true)

	ctx.fillStyle = '#FFFFFF'
	roundRect(ctx, x, y, size, size, shape.panelRadius)
	ctx.fill()

	ctx.save()
	ctx.translate(x, y)
	ctx.fillStyle = QR_INK
	ctx.beginPath()
	for (const d of shape.dots) {
		ctx.moveTo(d.x + d.r, d.y)
		ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
	}
	ctx.fill()
	ctx.fill(new Path2D(shape.finderRings), 'evenodd')
	for (const e of shape.finderEyes) {
		roundRect(ctx, e.x, e.y, e.s, e.s, e.r)
		ctx.fill()
	}

	// Pause symbol. qrShape(…, true) always makes room for it, so logoRadius is set.
	const r = shape.logoRadius!
	const { x: cx, y: cy } = shape.centre
	ctx.fillStyle = BRAND_ORANGE
	ctx.beginPath()
	ctx.arc(cx, cy, r, 0, Math.PI * 2)
	ctx.fill()
	ctx.fillStyle = '#FFFFFF'
	const bars = pauseBars(r)
	ctx.fillRect(cx + bars.leftX, cy + bars.y, bars.w, bars.h)
	ctx.fillRect(cx + bars.rightX, cy + bars.y, bars.w, bars.h)
	ctx.restore()
}

interface QrLayout {
	codes: QrCode[]
	size: number
	gap: number
	labelFont: number
	/** Height of the label strip under the panels, 0 when no code has a label. */
	labelH: number
	blockW: number
	blockH: number
	/** True when the codes sit beside the CTA, false when they get their own row above it. */
	side: boolean
}

function qrLayout(a: DrawArgs, g: Geometry): QrLayout | null {
	const codes = usableQrCodes(a.qrCodes)
	if (codes.length === 0) return null
	// Plan at export size (the preview is scaled down), then scale back to this canvas.
	const plan = qrPlan({
		width: (a.width - 2 * a.bleedPx) / a.scale,
		height: (a.height - 2 * a.bleedPx) / a.scale,
		dpi: a.dpi,
		urls: codes.map((c) => c.url),
		track: a.trackQr,
		sizePref: a.qrSize
	})
	if (plan.reason)
		a.lint?.add({ id: 'qr-plan', level: plan.ok ? 'info' : 'warn', message: plan.reason })
	lintQrTargets(a, codes)
	if (!plan.ok) return null
	const shown = codes.slice(0, plan.shown)
	const size = plan.size * a.scale
	const gap = QR_GAP_UNITS * g.u
	const labelFont = 22 * g.u
	const labelH = shown.some((c) => c.label.trim()) ? labelFont * 1.7 : 0
	const blockW = shown.length * size + (shown.length - 1) * gap
	return {
		codes: shown,
		size,
		gap,
		labelFont,
		labelH,
		blockW,
		blockH: size + labelH,
		side: shown.length === 1 || blockW <= g.cw * 0.42
	}
}

/** Flags codes that repeat each other, or that all open somewhere other than the web address printed on the design. */
function lintQrTargets(a: DrawArgs, codes: QrCode[]) {
	if (!a.lint) return
	const targets = codes.map((c) => normaliseUrl(c.url).toLowerCase().replace(/\/+$/, ''))
	if (new Set(targets).size < targets.length) {
		a.lint.add({
			id: 'qr-duplicate',
			level: 'warn',
			scope: 'design',
			message: 'Two of your QR codes open the same address.'
		})
	}
	const shownUrl = a.values.url?.trim()
	const printed = shownUrl ? normaliseUrl(shownUrl).toLowerCase().replace(/\/+$/, '') : ''
	// An events page lists every event, so printing it while a code opens one event is intended: PauseAI's, or a
	// chapter's own site once one of its events was imported.
	const hub = printed === normaliseUrl(EVENTS_PAGE_URL) || codes.some((c) => isLumaEventLink(c.url))
	if (printed && !hub && !targets.includes(printed)) {
		a.lint.add({
			id: 'qr-mismatch',
			level: 'info',
			scope: 'design',
			message: `No QR code opens ${shownUrl}, the web address on the design. Check that is intended.`
		})
	}
}

function drawQrBlock(a: DrawArgs, q: QrLayout, x: number, y: number) {
	const { ctx, theme } = a
	const measure = measurer(ctx, 700, BODY_FONT)
	q.codes.forEach((code, i) => {
		const px = x + i * (q.size + q.gap)
		drawQr(a, qrTarget(code.url, a.trackQr), px, y, q.size)
		const label = code.label.trim()
		if (!label) return
		let size = q.labelFont
		while (measure(label, size) > q.size && size > q.labelFont * 0.6) size *= 0.94
		ctx.fillStyle = theme.text
		ctx.font = font(700, size, BODY_FONT)
		ctx.textAlign = 'center'
		ctx.textBaseline = 'top'
		fillText(a, label, px + q.size / 2, y + q.size + q.labelFont * 0.4, q.size)
	})
}

/** A long web address may shrink to this share of the footer font before the layout changes to make room. */
const MIN_URL_SCALE = 0.75

/** CTA pill plus URL and optional QR codes along the bottom margin. Returns the y of the footer's top edge. */
function drawFooter(a: DrawArgs, g: Geometry): number {
	const { ctx, theme, values } = a
	const cta = values.cta?.trim()
	const url = values.url?.trim()
	const fs = (g.cls === 'banner' ? 26 : 30) * g.u
	const pillH = cta || url ? fs * 1.9 : 0
	const gap = 26 * g.u

	const pillText = cta ?? ''
	const pillW = cta ? measurer(ctx, 800, BODY_FONT)(pillText, fs) + fs * 1.8 : 0
	const urlW = url ? measurer(ctx, 700, BODY_FONT)(url, fs) : 0

	// Codes beside the text only get that spot if the pill and the URL (shrunk no further than
	// MIN_URL_SCALE) fit in what is left of the row. Otherwise they take their own row, so nothing overlaps.
	const planned = qrLayout(a, g)
	const besideRoom = planned ? g.right - planned.blockW - gap - g.left : g.cw
	const fitsBeside = pillW <= besideRoom && urlW * MIN_URL_SCALE <= besideRoom
	const q = planned?.side && !fitsBeside ? { ...planned, side: false } : planned
	const textRight = q?.side ? g.right - q.blockW - gap : g.right

	const stacked = Boolean(cta && url && g.left + pillW + gap + urlW > textRight)
	// When stacked, the URL sits on its own line below the pill, so the pill always comes first.
	const stackH = stacked ? fs * 1.7 : 0
	const urlX = cta && !stacked ? g.left + pillW + gap : g.left
	const urlRoom = Math.max(0, textRight - urlX)
	const urlFs = urlW > urlRoom ? Math.max(fs * MIN_URL_SCALE, (fs * urlRoom) / urlW) : fs
	const textH = pillH + stackH

	let textBottom = g.bottom
	let top = g.bottom - textH
	if (q) {
		if (q.side) {
			const qy = g.bottom - q.blockH
			drawQrBlock(a, q, g.right - q.blockW, qy)
			// Centre the text block on the QR panels.
			textBottom = Math.min(g.bottom, qy + q.size / 2 + textH / 2)
			top = Math.min(qy, textBottom - textH)
		} else {
			const qy = g.bottom - textH - (textH ? gap : 0) - q.blockH
			drawQrBlock(a, q, g.left, qy)
			top = qy
		}
	}

	const pillX = g.left
	const pillY = textBottom - textH
	const urlY = stacked ? pillY + pillH + fs * 0.85 : pillY + pillH / 2
	if (cta) {
		ctx.fillStyle = theme.accent
		roundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2)
		ctx.fill()
		ctx.fillStyle = theme.onAccent
		ctx.font = font(800, fs, BODY_FONT)
		ctx.textAlign = 'left'
		ctx.textBaseline = 'middle'
		ctx.fillText(pillText, pillX + fs * 0.9, pillY + pillH / 2 + fs * 0.04)
	}
	if (url) {
		ctx.fillStyle = theme.text
		ctx.font = font(700, urlFs, BODY_FONT)
		ctx.textAlign = 'left'
		ctx.textBaseline = 'middle'
		// maxWidth squeezes a URL that is still too long at the smallest size, rather than letting it run under a QR code.
		fillText(a, url, urlX, urlY, urlRoom)
	}
	return top
}

/** Lines of text from the top-left of a block. */
function drawLines(a: DrawArgs, lines: string[], x: number, y: number, lineHeightPx: number) {
	a.ctx.textAlign = 'left'
	a.ctx.textBaseline = 'top'
	lines.forEach((line, i) => fillText(a, line, x, y + i * lineHeightPx))
}

function drawKicker(a: DrawArgs, g: Geometry, text: string, y: number): number {
	const { ctx } = a
	const size = 30 * g.u
	const tracking = size * 0.16
	ctx.font = font(800, size, BODY_FONT)
	setTracking(ctx, tracking)
	ctx.fillStyle = smallTextColours(a).accentText
	ctx.textBaseline = 'top'
	ctx.textAlign = 'left'
	fillText(a, text.toUpperCase(), g.left, y)
	setTracking(ctx, 0)
	return size * 1.3
}

/** The title's automatic size range, scaled by the title size nudge. */
function headlineRange(
	a: DrawArgs,
	maxFont: number,
	minFont: number
): { maxFont: number; minFont: number } {
	const k = a.headlineScale ?? 1
	return { maxFont: maxFont * k, minFont: minFont * k }
}

/** Checks list entries for a fitted title. */
function lintHeadline(a: DrawArgs, fit: FitResult, maxFont: number) {
	if (!a.lint || fit.lines.every((l) => !l)) return
	if (fit.overflow) {
		a.lint.add({
			id: 'text-overflow',
			level: 'warn',
			message:
				'The text does not fit. Shorten it, turn the title size down, or pick a bigger format.'
		})
	} else if (fit.fontSize < maxFont * 0.4) {
		a.lint.add({
			id: 'title-small',
			level: 'info',
			message: 'The title had to shrink a lot to fit. Shorter text will read better.'
		})
	}
}

interface Zone {
	top: number
	bottom: number
	height: number
}

function bodyZone(a: DrawArgs, g: Geometry): Zone {
	const headerBottom = drawHeader(a, g)
	const footerTop = drawFooter(a, g)
	const gap = (g.cls === 'banner' ? 24 : 44) * g.u
	const top = headerBottom + gap
	const bottom = footerTop - gap
	return { top, bottom, height: Math.max(0, bottom - top) }
}

function maxHeadlineFont(cls: AspectClass, u: number): number {
	const units = { square: 150, portrait: 160, story: 180, landscape: 140, banner: 100 }[cls]
	return units * u
}

// ---------------------------------------------------------------------------
// Templates

const FOOTER_FIELDS: FieldDef[] = [
	{
		key: 'cta',
		label: 'Button text',
		kind: 'text',
		maxLength: 28,
		hint: 'Optional',
		default: 'Join PauseAI'
	},
	{
		key: 'url',
		label: 'Web address',
		kind: 'text',
		maxLength: 60,
		hint: 'Short reads best',
		default: 'pauseai.info/join'
	},
	{
		key: 'group',
		label: 'Local group',
		kind: 'text',
		maxLength: 24,
		hint: 'Optional, e.g. a city',
		default: ''
	}
]

const announcement: Template = {
	id: 'announcement',
	label: 'Announcement',
	description: 'Big headline with a call to action. Good for social posts and slides.',
	fields: [
		{ key: 'kicker', label: 'Kicker', kind: 'text', maxLength: 40, default: 'Take action' },
		{
			key: 'headline',
			label: 'Headline',
			kind: 'textarea',
			maxLength: 90,
			default: 'Safety before superintelligence'
		},
		{
			key: 'sub',
			label: 'Sub-line',
			kind: 'textarea',
			maxLength: 140,
			default: 'Community-led action for safe and accountable AI.'
		},
		...FOOTER_FIELDS
	],
	draw(a) {
		const g = geometry(a)
		paintBackground(a)
		const zone = bodyZone(a, g)
		const { ctx, theme, values } = a

		const kicker = values.kicker?.trim()
		const kickerH = kicker ? 30 * g.u * 1.3 + 22 * g.u : 0
		const sub = values.sub?.trim()
		const subReserve = sub ? Math.min(zone.height * 0.3, 200 * g.u) : 0
		const headlineText = values.headline ?? ''

		const range = headlineRange(a, maxHeadlineFont(g.cls, g.u), 34 * g.u)
		const headline = fitText(measurer(ctx, 700, DISPLAY_FONT), headlineText, {
			maxWidth: g.cw,
			maxHeight: Math.max(0, zone.height - kickerH - subReserve),
			...range,
			lineHeight: 1.02
		})
		lintHeadline(a, headline, range.maxFont)
		const subFit = sub
			? fitText(measurer(ctx, 500, BODY_FONT), sub, {
					maxWidth: g.cw * (g.cls === 'banner' ? 0.8 : 0.92),
					maxHeight: Math.max(0, subReserve - 22 * g.u),
					maxFont: 44 * g.u,
					minFont: 24 * g.u,
					lineHeight: 1.35
				})
			: null

		const subH = subFit ? subFit.height + 22 * g.u : 0
		const total = kickerH + headline.height + subH
		let y = zone.top + Math.max(0, (zone.height - total) / 2)

		if (subFit?.overflow) lintHeadline(a, subFit, subFit.fontSize)

		if (kicker) {
			drawKicker(a, g, kicker, y)
			y += kickerH
		}
		ctx.fillStyle = theme.text
		ctx.font = font(700, headline.fontSize, DISPLAY_FONT)
		drawLines(a, headline.lines, g.left, y, headline.lineHeightPx)
		y += headline.height
		if (subFit) {
			y += 22 * g.u
			ctx.fillStyle = smallTextColours(a).muted
			ctx.font = font(500, subFit.fontSize, BODY_FONT)
			drawLines(a, subFit.lines, g.left, y, subFit.lineHeightPx)
		}
	}
}

const event: Template = {
	id: 'event',
	label: 'Event',
	description: 'Title, date, time and place. For flyers, Luma covers and event posts.',
	fields: [
		{ key: 'kicker', label: 'Kicker', kind: 'text', maxLength: 40, default: 'Join us' },
		{
			key: 'headline',
			label: 'Event title',
			kind: 'textarea',
			maxLength: 80,
			default: 'Letter writing night'
		},
		{ key: 'date', label: 'Date', kind: 'date', default: exampleEventDate() },
		{ key: 'start', label: 'Start time', kind: 'time', default: '19:00' },
		{ key: 'end', label: 'End time', kind: 'time', hint: 'Optional', default: '' },
		{ key: 'venue', label: 'Venue', kind: 'text', maxLength: 60, default: 'Venue name, City' },
		{
			key: 'blurb',
			label: 'Short description',
			kind: 'textarea',
			maxLength: 120,
			default: 'Meet local volunteers and write to your representatives about AI safety.'
		},
		{ ...FOOTER_FIELDS[0], default: 'RSVP on Luma' },
		{ ...FOOTER_FIELDS[1], default: EVENTS_PAGE_URL },
		...FOOTER_FIELDS.slice(2)
	],
	draw(a) {
		const g = geometry(a)
		paintBackground(a)
		const zone = bodyZone(a, g)
		const { ctx, theme, values } = a
		const compact = g.cls === 'banner'

		const kicker = values.kicker?.trim()
		const kickerH = kicker ? 30 * g.u * 1.3 + 22 * g.u : 0
		const whenParts = [
			formatPickedDate(values.date ?? ''),
			formatPickedTimeRange(values.start ?? '', values.end ?? '')
		].filter(Boolean)
		const venue = values.venue?.trim()
		const blurb = compact ? '' : (values.blurb?.trim() ?? '')

		const headlineText = values.headline ?? ''

		// Lays the body out with the date and venue at `detailScale` of their full size, with or without the description.
		const fitBody = (detailScale: number, withBlurb: boolean) => {
			const dateSize = (compact ? 34 : 50) * g.u * detailScale
			const venueSize = (compact ? 28 : 38) * g.u * detailScale
			const venueFit = venue
				? fitText(measurer(ctx, 600, BODY_FONT), venue, {
						maxWidth: g.cw - 30 * g.u,
						maxHeight: 2 * venueSize * 1.25,
						maxFont: venueSize,
						minFont: Math.min(venueSize, 22 * g.u),
						lineHeight: 1.25
					})
				: null
			// "Date · time" on one line. When that would wrap, the time takes its own line instead, so no line starts with a dot.
			const fitWhen = (text: string) =>
				fitText(measurer(ctx, 800, BODY_FONT), text, {
					maxWidth: g.cw - 30 * g.u,
					maxHeight: dateSize * 1.3 * 2,
					maxFont: dateSize,
					minFont: Math.min(dateSize, 24 * g.u),
					lineHeight: 1.25
				})
			const oneLine = whenParts.length ? fitWhen(whenParts.join(' · ')) : null
			const whenFit = oneLine && oneLine.lines.length > 1 ? fitWhen(whenParts.join('\n')) : oneLine
			const detailsH = (whenFit?.height ?? 0) + (venueFit ? venueFit.height + 6 * g.u : 0)
			const detailsBlock = detailsH ? detailsH + 30 * g.u : 0

			const blurbReserve = withBlurb && blurb ? Math.min(zone.height * 0.2, 130 * g.u) : 0
			const blurbFit = blurbReserve
				? fitText(measurer(ctx, 500, BODY_FONT), blurb, {
						maxWidth: g.cw * 0.92,
						maxHeight: Math.max(0, blurbReserve - 18 * g.u),
						maxFont: 34 * g.u,
						minFont: 22 * g.u,
						lineHeight: 1.35
					})
				: null
			const blurbH = blurbFit ? blurbFit.height + 18 * g.u : 0

			// The title always stays bigger than the date, so the hierarchy survives a crowded layout.
			const range = headlineRange(a, maxHeadlineFont(g.cls, g.u) * 0.9, 34 * g.u)
			const headline = fitText(measurer(ctx, 700, DISPLAY_FONT), headlineText, {
				maxWidth: g.cw,
				maxHeight: Math.max(0, zone.height - kickerH - detailsBlock - blurbH),
				maxFont: range.maxFont,
				minFont: Math.max(range.minFont, (whenFit?.fontSize ?? 0) * 1.15),
				lineHeight: 1.02
			})
			return {
				venueFit,
				whenFit,
				detailsH,
				detailsBlock,
				blurbFit,
				blurbH,
				headline,
				maxFont: range.maxFont
			}
		}

		// When space runs out, shrink the date and venue a little, then drop the description, then shrink them further.
		// The last step is used even if it still overflows.
		const steps: [number, boolean][] = [
			[1, true],
			[0.8, true],
			[1, false],
			[0.8, false],
			[0.65, false]
		]
		let body = fitBody(...steps[0])
		for (const step of steps.slice(1)) {
			if (!body.headline.overflow) break
			body = fitBody(...step)
		}
		const { venueFit, whenFit, detailsH, detailsBlock, blurbFit, blurbH, headline, maxFont } = body
		lintHeadline(a, headline, maxFont)
		if (blurb && !blurbFit) {
			a.lint?.add({
				id: 'blurb-dropped',
				level: 'info',
				message: 'The short description was left out to make room.'
			})
		}

		const total = kickerH + headline.height + detailsBlock + blurbH
		let y = zone.top + Math.max(0, (zone.height - total) / 2)

		if (kicker) {
			drawKicker(a, g, kicker, y)
			y += kickerH
		}
		ctx.fillStyle = theme.text
		ctx.font = font(700, headline.fontSize, DISPLAY_FONT)
		drawLines(a, headline.lines, g.left, y, headline.lineHeightPx)
		y += headline.height

		if (detailsH) {
			y += 30 * g.u
			// The details hang off an accent rule.
			const textX = g.left + 30 * g.u
			ctx.fillStyle = theme.accentText
			ctx.fillRect(g.left, y, 8 * g.u, detailsH)
			let ty = y
			if (whenFit) {
				ctx.fillStyle = theme.text
				ctx.font = font(800, whenFit.fontSize, BODY_FONT)
				drawLines(a, whenFit.lines, textX, ty, whenFit.lineHeightPx)
				ty += whenFit.height + 6 * g.u
			}
			if (venueFit) {
				ctx.fillStyle = smallTextColours(a).muted
				ctx.font = font(600, venueFit.fontSize, BODY_FONT)
				drawLines(a, venueFit.lines, textX, ty, venueFit.lineHeightPx)
			}
			y += detailsH
		}
		if (blurbFit) {
			y += 18 * g.u
			ctx.fillStyle = smallTextColours(a).muted
			ctx.font = font(500, blurbFit.fontSize, BODY_FONT)
			drawLines(a, blurbFit.lines, g.left, y, blurbFit.lineHeightPx)
		}
	}
}

const quote: Template = {
	id: 'quote',
	label: 'Quote',
	description: 'A quote or statistic with attribution. For stories and shareable statements.',
	fields: [
		{
			key: 'quote',
			label: 'Quote or statistic',
			kind: 'textarea',
			maxLength: 220,
			default: 'We can still choose to build AI that is safe and accountable.'
		},
		{
			key: 'name',
			label: 'Name or source',
			kind: 'text',
			maxLength: 40,
			default: 'Volunteer name'
		},
		{
			key: 'role',
			label: 'Role or detail',
			kind: 'text',
			maxLength: 48,
			default: 'PauseAI volunteer'
		},
		{ ...FOOTER_FIELDS[0], default: 'Read more stories' },
		{ ...FOOTER_FIELDS[1], default: 'pauseai.info/join' },
		...FOOTER_FIELDS.slice(2)
	],
	draw(a) {
		const g = geometry(a)
		paintBackground(a)
		const zone = bodyZone(a, g)
		const { ctx, theme, values } = a
		const compact = g.cls === 'banner'

		const name = values.name?.trim()
		const role = values.role?.trim()
		const attrH =
			name || role ? (name ? 34 * g.u * 1.3 : 0) + (role ? 28 * g.u * 1.4 : 0) + 30 * g.u : 0
		const markH = compact ? 0 : 110 * g.u

		const range = headlineRange(
			a,
			(g.cls === 'story' ? 96 : g.cls === 'banner' ? 64 : 84) * g.u,
			28 * g.u
		)
		const q = fitText(measurer(ctx, 700, DISPLAY_FONT), values.quote ?? '', {
			maxWidth: g.cw,
			maxHeight: Math.max(0, zone.height - attrH - markH),
			...range,
			lineHeight: 1.15
		})
		lintHeadline(a, q, range.maxFont)

		const total = markH + q.height + attrH
		let y = zone.top + Math.max(0, (zone.height - total) / 2)
		if (markH) {
			ctx.fillStyle = theme.accentText
			ctx.font = font(700, 260 * g.u, DISPLAY_FONT)
			ctx.textAlign = 'left'
			ctx.textBaseline = 'alphabetic'
			fillText(a, '“', g.left - 6 * g.u, y + 210 * g.u)
			y += markH
		}
		ctx.fillStyle = theme.text
		ctx.font = font(700, q.fontSize, DISPLAY_FONT)
		drawLines(a, q.lines, g.left, y, q.lineHeightPx)
		y += q.height

		if (attrH) {
			y += 30 * g.u
			ctx.textAlign = 'left'
			if (name) {
				const tracking = 34 * g.u * 0.1
				ctx.font = font(800, 34 * g.u, BODY_FONT)
				setTracking(ctx, tracking)
				ctx.fillStyle = smallTextColours(a).accentText
				ctx.textBaseline = 'top'
				fillText(a, name.toUpperCase(), g.left, y)
				setTracking(ctx, 0)
				y += 34 * g.u * 1.3
			}
			if (role) {
				ctx.font = font(500, 28 * g.u, BODY_FONT)
				ctx.fillStyle = smallTextColours(a).muted
				ctx.textBaseline = 'top'
				fillText(a, role, g.left, y)
			}
		}
	}
}

const caption: Template = {
	id: 'caption',
	label: 'Caption',
	description:
		'A photo with a short caption. Built as one slide of a gallery or carousel post — one idea per slide.',
	fields: [{ key: 'caption', label: 'Caption', kind: 'textarea', maxLength: 200, default: '' }],
	draw(a) {
		const g = geometry(a)
		paintBackground(a)
		const { ctx, values } = a
		const text = (values.caption ?? '').trim()
		if (!text) return

		const pad = 40 * g.u
		const fit = fitText(measurer(ctx, 700, BODY_FONT), text, {
			maxWidth: g.cw,
			maxHeight: a.height * 0.32,
			maxFont: 46 * g.u,
			minFont: 22 * g.u,
			lineHeight: 1.35
		})
		const bandH = fit.height + pad * 2
		const bandY = a.height - a.bleedPx - bandH
		// A dark scrim reads under white text over any photo or theme colour, so captions don't need per-theme tuning.
		ctx.fillStyle = 'rgba(15, 12, 10, 0.6)'
		ctx.fillRect(a.bleedPx, bandY, a.width - 2 * a.bleedPx, bandH)
		ctx.fillStyle = '#FFFFFF'
		ctx.font = font(700, fit.fontSize, BODY_FONT)
		// Drawn directly rather than through drawLines: the band already backs the text, so it needs no outline.
		ctx.textAlign = 'left'
		ctx.textBaseline = 'top'
		fit.lines.forEach((line, i) => ctx.fillText(line, g.left, bandY + pad + i * fit.lineHeightPx))
	}
}

export const TEMPLATES: Template[] = [announcement, event, quote, caption]
export const DEFAULT_TEMPLATE_ID = 'announcement'

export function getTemplate(id: string): Template {
	return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]
}

/** A layout's default text. `overrides` (e.g. a chapter's, see chapterFieldDefaults) replace defaults of fields the layout has. */
export function defaultValues(template: Template, overrides: Values = {}): Values {
	return Object.fromEntries(template.fields.map((f) => [f.key, overrides[f.key] ?? f.default]))
}
