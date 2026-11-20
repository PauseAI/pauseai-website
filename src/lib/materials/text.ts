/** Returns the rendered width of `text` at `fontSize`. Injected so tests can run without a canvas. */
export type Measure = (text: string, fontSize: number) => number

export interface FitOptions {
	maxWidth: number
	maxHeight: number
	maxFont: number
	minFont: number
	/** Line height as a multiple of font size. */
	lineHeight: number
}

export interface FitResult {
	fontSize: number
	lines: string[]
	lineHeightPx: number
	height: number
	/** True when even `minFont` does not fit. */
	overflow: boolean
}

/** Greedy word wrap. Explicit newlines are kept. */
export function wrapLines(
	measure: Measure,
	text: string,
	fontSize: number,
	maxWidth: number
): string[] {
	const out: string[] = []
	for (const paragraph of text.split('\n')) {
		const words = paragraph.split(/\s+/).filter(Boolean)
		if (words.length === 0) {
			out.push('')
			continue
		}
		let line = words[0]
		for (const word of words.slice(1)) {
			const next = `${line} ${word}`
			if (measure(next, fontSize) <= maxWidth) line = next
			else {
				out.push(line)
				line = word
			}
		}
		out.push(line)
	}
	return out
}

/** Largest font size, between `minFont` and `maxFont`, at which the wrapped text fits the box. */
export function fitText(measure: Measure, text: string, opts: FitOptions): FitResult {
	const { maxWidth, maxHeight, maxFont, minFont, lineHeight } = opts
	const clean = text.trim()
	let size = maxFont
	for (;;) {
		const lines = wrapLines(measure, clean, size, maxWidth)
		const lineHeightPx = size * lineHeight
		const height = lines.length * lineHeightPx
		const widest = Math.max(0, ...lines.map((l) => measure(l, size)))
		const fits = height <= maxHeight && widest <= maxWidth
		if (fits || size <= minFont) {
			return { fontSize: size, lines, lineHeightPx, height, overflow: !fits }
		}
		size = Math.max(minFont, Math.floor(size * 0.96))
	}
}

/** Rectangle to draw an image so it covers a target area, zoomed and positioned by a 0..1 focal point. */
export function coverRect(
	imgW: number,
	imgH: number,
	boxW: number,
	boxH: number,
	zoom = 1,
	focalX = 0.5,
	focalY = 0.5
) {
	const scale = Math.max(boxW / imgW, boxH / imgH) * Math.max(1, zoom)
	const w = imgW * scale
	const h = imgH * scale
	// `|| 0` normalises -0
	return { x: -(w - boxW) * focalX || 0, y: -(h - boxH) * focalY || 0, w, h }
}
