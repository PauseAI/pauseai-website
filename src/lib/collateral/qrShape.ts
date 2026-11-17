import { QR_PANEL_PAD, qrMatrix } from './qr'
import { captionFont, type CaptionLayout } from './qrCaption'
import { BRAND_ORANGE, INK } from './themes'

/** One round data module, in px relative to the top-left of the QR panel. */
export interface QrDot {
	x: number
	y: number
	r: number
}

export interface QrRect {
	x: number
	y: number
	s: number
	/** Corner rounding. */
	r: number
}

export interface QrShape {
	size: number
	/** Modules per side. Denser codes need to be printed bigger. */
	modules: number
	panelRadius: number
	/** Round data modules, everything except the three corner marks. */
	dots: QrDot[]
	/** SVG path data for the three rounded rings around the corner marks. Fill with the even-odd rule. */
	finderRings: string
	/** The solid rounded squares in the middle of the corner marks. */
	finderEyes: QrRect[]
	centre: { x: number; y: number }
	/** Radius of the pause symbol in the middle, or null when the code has no logo. */
	logoRadius: number | null
}

/** Corner mark rounding, in modules. Outer edge of the ring, and the edge of the hole inside it. */
const RING_OUTER_RADIUS = 2.4
const RING_INNER_RADIUS = 1.4
/** Rounding of the square in the middle of each corner mark, in modules. */
const EYE_RADIUS = 0.8
/**
 * Radius of the square cleared for the pause symbol, as a share of the panel. Small enough that a code of any length
 * the tools take stays readable: larger, and codes 25 and 69 modules wide stop scanning. The symbol itself grows by up
 * to a module, to just short of the dots around the square.
 */
const LOGO_RADIUS = 0.115
/** The gap between the pause symbol and the nearest dots, in modules: enough that they don't quite touch. */
const LOGO_GAP = 0.15
/** A dot is a touch wider than its module so neighbours join up, as in the reference style. */
const DOT_SCALE = 1.03

/** Pure black gives the best contrast for scanners, and matches the reference style. */
export const QR_INK = '#000000'

const n = (v: number) => Number(v.toFixed(2))

/** SVG path data for a rounded rectangle. */
function roundedRect(x: number, y: number, w: number, h: number, r: number): string {
	return (
		`M${n(x + r)} ${n(y)}H${n(x + w - r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + w)} ${n(y + r)}` +
		`V${n(y + h - r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + w - r)} ${n(y + h)}` +
		`H${n(x + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x)} ${n(y + h - r)}` +
		`V${n(y + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + r)} ${n(y)}Z`
	)
}

/**
 * The geometry of a QR code: round dots, rounded ring-and-square corner marks, and optionally the
 * pause symbol in the middle. The canvas designs and the standalone generator both read this, so a
 * code looks the same wherever it appears.
 */
export function qrShape(target: string, size: number, logo: boolean): QrShape {
	const matrix = qrMatrix(target)
	const modules = matrix.length
	const pad = size * QR_PANEL_PAD
	const cell = (size - pad * 2) / modules
	const centre = { x: size / 2, y: size / 2 }

	// Top-left corners of the three 7x7 corner marks, in modules.
	const corners = [
		[0, 0],
		[modules - 7, 0],
		[0, modules - 7]
	]
	const inFinder = (row: number, col: number) =>
		corners.some(([c, r]) => col >= c && col < c + 7 && row >= r && row < r + 7)

	const r = (cell / 2) * DOT_SCALE
	// The logo sits on a white square as wide as it is, its corners showing: the modules cleared for it, out from
	// the middle one, are those that would touch a square LOGO_RADIUS wide. The highest error correction level
	// covers them. The logo then grows to just short of the dots left around it, so the gap between them is the
	// same hairline whatever the code's density.
	const mid = (modules - 1) / 2
	const cleared = Math.ceil((size * LOGO_RADIUS) / cell + DOT_SCALE / 2) - 1
	const logoRadius = (cleared + 1) * cell - r - LOGO_GAP * cell

	const dots: QrDot[] = []
	matrix.forEach((line, row) =>
		line.forEach((dark, col) => {
			if (!dark || inFinder(row, col)) return
			if (logo && Math.max(Math.abs(col - mid), Math.abs(row - mid)) <= cleared) return
			dots.push({ x: pad + (col + 0.5) * cell, y: pad + (row + 0.5) * cell, r })
		})
	)

	const rings: string[] = []
	const finderEyes: QrRect[] = []
	for (const [c, r] of corners) {
		const x = pad + c * cell
		const y = pad + r * cell
		rings.push(roundedRect(x, y, 7 * cell, 7 * cell, RING_OUTER_RADIUS * cell))
		rings.push(roundedRect(x + cell, y + cell, 5 * cell, 5 * cell, RING_INNER_RADIUS * cell))
		finderEyes.push({ x: x + 2 * cell, y: y + 2 * cell, s: 3 * cell, r: EYE_RADIUS * cell })
	}

	return {
		size,
		modules,
		panelRadius: size * 0.08,
		dots,
		finderRings: rings.join(''),
		finderEyes,
		centre,
		logoRadius: logo ? logoRadius : null
	}
}

/** Pause symbol bars, relative to the logo radius. */
export function pauseBars(r: number) {
	const w = r * 0.26
	const h = r * 0.9
	return { w, h, leftX: -w * 1.5, rightX: w * 0.5, y: -h / 2 }
}

const escapeXml = (text: string) =>
	text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export interface QrSvgOptions {
	background: string | null
	roundedPanel?: boolean
	/** Text under the code, from captionLayout at the same size. The image grows taller to fit it. */
	caption?: CaptionLayout
	/** @font-face rules to embed, so the caption keeps its fonts outside the site (see captionFontCss). */
	fontCss?: string
}

/** Standalone SVG for the QR code. Vector, so it stays sharp at any print size. */
export function qrSvg(shape: QrShape, opts: QrSvgOptions): string {
	const { size, dots, finderRings, finderEyes, centre, logoRadius, panelRadius } = shape
	const height = opts.caption?.height ?? size
	const parts = [
		`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${height}" viewBox="0 0 ${n(size)} ${n(height)}">`
	]
	if (opts.fontCss && opts.caption?.lines.length)
		parts.push(`<defs><style>${opts.fontCss}</style></defs>`)
	if (opts.background) {
		const rx = opts.roundedPanel === false ? '' : ` rx="${n(panelRadius)}"`
		parts.push(`<rect width="${n(size)}" height="${n(height)}"${rx} fill="${opts.background}"/>`)
	}
	parts.push(`<g fill="${QR_INK}">`)
	for (const d of dots) parts.push(`<circle cx="${n(d.x)}" cy="${n(d.y)}" r="${n(d.r)}"/>`)
	parts.push(`<path fill-rule="evenodd" d="${finderRings}"/>`)
	for (const e of finderEyes) parts.push(`<path d="${roundedRect(e.x, e.y, e.s, e.s, e.r)}"/>`)
	parts.push('</g>')
	if (logoRadius !== null) {
		const bars = pauseBars(logoRadius)
		parts.push(
			`<circle cx="${n(centre.x)}" cy="${n(centre.y)}" r="${n(logoRadius)}" fill="${BRAND_ORANGE}"/>`
		)
		parts.push(
			`<g fill="#FFFFFF"><rect x="${n(centre.x + bars.leftX)}" y="${n(centre.y + bars.y)}" width="${n(bars.w)}" height="${n(bars.h)}"/>` +
				`<rect x="${n(centre.x + bars.rightX)}" y="${n(centre.y + bars.y)}" width="${n(bars.w)}" height="${n(bars.h)}"/></g>`
		)
	}
	for (const line of opts.caption?.lines ?? []) {
		parts.push(
			`<text x="${n(size / 2)}" y="${n(line.baseline)}" text-anchor="middle" fill="${INK}" ` +
				`style="font:${escapeXml(captionFont(line.kind, n(line.fontSize)))}">${escapeXml(line.text)}</text>`
		)
	}
	parts.push('</svg>')
	return parts.join('\n')
}
