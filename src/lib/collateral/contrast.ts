/**
 * Measured contrast between text and the photo behind it, using the WCAG contrast ratio.
 *
 * Plain style colours are checked once in themes.test.ts. A photo changes from pixel to pixel, so each line of
 * text is measured against the pixels actually behind it, and the tint steps are worked out from one untinted
 * copy of the photo: a tinted pixel is just the photo blended with the style colour.
 */

export type Rgb = [number, number, number]

export function hexToRgb(hex: string): Rgb | null {
	const m = /^#([0-9a-f]{6})$/i.exec(hex.trim())
	if (!m) return null
	const n = parseInt(m[1], 16)
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function channel(v: number): number {
	const s = v / 255
	return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

/** channel() for each 0–255 value, since the pixel loop below would otherwise call pow() three times a pixel. */
const LINEAR = Float64Array.from({ length: 256 }, (_, v) => channel(v))

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function luminance([r, g, b]: Rgb): number {
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrastOf(l1: number, l2: number): number {
	const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
	return (hi + 0.05) / (lo + 0.05)
}

/** WCAG AA: 4.5:1 for normal text, 3:1 for large text. */
function requiredContrast(large: boolean): number {
	return large ? 3 : 4.5
}

/** An untinted copy of the photo as drawn, at a small size. RGBA, like ImageData. */
export interface Backdrop {
	pixels: Uint8ClampedArray
	width: number
	height: number
}

export interface Rect {
	x: number
	y: number
	w: number
	h: number
}

/** One line of text drawn over the photo, with its box in backdrop pixels. */
export interface TextSample {
	text: string
	rect: Rect
	rgb: Rgb
	/** Large text needs 3:1 rather than 4.5:1. */
	large: boolean
	/** Extra share of the style colour a halo behind the text adds over the tint, 0 when it has none. */
	halo?: number
}

/** Share of pixels behind a line that may fall below the pass mark: one bright spot should not fail a whole title. */
const WORST_SHARE = 0.1

/**
 * Contrast behind `rect` once the style colour `bg` is blended over the photo, so that `visible` of the photo shows.
 * `low` is the contrast the worst 10% of pixels give; `spread` is the standard deviation of their luminance,
 * which is high for a busy background. Null when the box has no pixels on the backdrop.
 */
export function sampleContrast(
	backdrop: Backdrop,
	rect: Rect,
	textRgb: Rgb,
	bg: Rgb,
	visible: number
): { low: number; spread: number } | null {
	const x0 = Math.max(0, Math.floor(rect.x))
	const y0 = Math.max(0, Math.floor(rect.y))
	const x1 = Math.min(backdrop.width, Math.ceil(rect.x + rect.w))
	const y1 = Math.min(backdrop.height, Math.ceil(rect.y + rect.h))
	if (x1 <= x0 || y1 <= y0) return null

	const textL = luminance(textRgb)
	const n = (x1 - x0) * (y1 - y0)
	const p = backdrop.pixels
	// Canvas blends in sRGB: the tint is the style colour drawn over the photo at (1 - visible) opacity.
	const k = 1 - visible
	// A histogram of contrast finds the worst tenth in one pass, without sorting every pixel.
	const bins = HISTOGRAM.fill(0)
	let sum = 0
	let sumSq = 0
	for (let y = y0; y < y1; y++) {
		for (let x = x0; x < x1; x++) {
			const i = (y * backdrop.width + x) * 4
			const l =
				0.2126 * LINEAR[Math.round(p[i] * visible + bg[0] * k)] +
				0.7152 * LINEAR[Math.round(p[i + 1] * visible + bg[1] * k)] +
				0.0722 * LINEAR[Math.round(p[i + 2] * visible + bg[2] * k)]
			bins[Math.min(BIN_COUNT - 1, Math.floor((contrastOf(textL, l) - 1) / BIN_WIDTH))]++
			sum += l
			sumSq += l * l
		}
	}
	let seen = 0
	let bin = 0
	const target = Math.floor((n - 1) * WORST_SHARE) + 1
	while (bin < BIN_COUNT - 1 && (seen += bins[bin]) < target) bin++
	const mean = sum / n
	return { low: 1 + bin * BIN_WIDTH, spread: Math.sqrt(Math.max(0, sumSq / n - mean * mean)) }
}

/** Contrast runs 1 to 21. Bins of 0.02 keep the reported ratio accurate to that, rounding down. */
const BIN_WIDTH = 0.02
const BIN_COUNT = Math.ceil(20 / BIN_WIDTH) + 1
/** Reused between calls, since the check runs on every redraw. */
const HISTOGRAM = new Uint32Array(BIN_COUNT)

export interface ContrastFailure {
	sample: TextSample
	low: number
	required: number
}

/** The line that falls furthest short of its pass mark at `visible`, or null when every line passes. */
export function worstFailure(
	backdrop: Backdrop,
	samples: TextSample[],
	bg: Rgb,
	visible: number
): ContrastFailure | null {
	let worst: ContrastFailure | null = null
	for (const sample of samples) {
		const result = sampleContrast(
			backdrop,
			sample.rect,
			sample.rgb,
			bg,
			visible * (1 - (sample.halo ?? 0))
		)
		if (!result) continue
		const required = requiredContrast(sample.large)
		if (result.low >= required) continue
		if (!worst || result.low / required < worst.low / worst.required)
			worst = { sample, low: result.low, required }
	}
	return worst
}

/** Luminance spread above which a background reads as busy, even when its contrast passes. Tuned by eye. */
const BUSY_SPREAD = 0.2

/** The first small line over a busy patch of photo, if any. Large text copes with busy backgrounds. */
export function busySample(
	backdrop: Backdrop,
	samples: TextSample[],
	bg: Rgb,
	visible: number
): TextSample | null {
	for (const sample of samples) {
		if (sample.large) continue
		const result = sampleContrast(
			backdrop,
			sample.rect,
			sample.rgb,
			bg,
			visible * (1 - (sample.halo ?? 0))
		)
		if (result && result.spread > BUSY_SPREAD) return sample
	}
	return null
}
