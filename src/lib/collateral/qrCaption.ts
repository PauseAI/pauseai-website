import { normaliseUrl, QR_PANEL_PAD } from './qr'
import {
	BODY_FAMILY,
	facesFor,
	HEADLINE_FAMILY,
	UNICODE_RANGES,
	type CanvasFace
} from './canvasFonts'
import { fitText } from './text'

/**
 * Text printed under a standalone QR code: an optional label, like "Join PauseAI", and optionally the link the
 * code opens, so people without a camera can still type it.
 */
export interface QrCaption {
	label: string
	link: string
}

export type CaptionKind = 'label' | 'link'

/** The label is set like a headline, the link like body text. Both families are canvas fonts (canvasFonts.ts). */
const CAPTION_FONTS: Record<CaptionKind, { family: string; weight: string }> = {
	label: { family: HEADLINE_FAMILY, weight: '700' },
	link: { family: BODY_FAMILY, weight: '500' }
}

/** Canvas and SVG font shorthand, with fallbacks for SVGs opened where the embedded fonts are not supported. */
export function captionFont(kind: CaptionKind, fontSize: number): string {
	const { family, weight } = CAPTION_FONTS[kind]
	const fallback =
		kind === 'label' ? '"Saira Condensed", Impact, sans-serif' : '"Roboto Slab", Georgia, serif'
	return `${weight} ${fontSize}px "${family}", ${fallback}`
}

export interface CaptionLine {
	kind: CaptionKind
	text: string
	fontSize: number
	/** Alphabetic baseline, in px from the top of the whole image. Text is centred horizontally. */
	baseline: number
}

export interface CaptionLayout {
	/** Height of the whole image: the square code panel plus the caption under it. */
	height: number
	lines: CaptionLine[]
	/** True when some text only fits by going past the edges, even at its smallest size. */
	overflow: boolean
}

/** Width of `text` in the given caption font, in px. Injected so tests can run without a canvas. */
export type CaptionMeasure = (kind: CaptionKind, text: string, fontSize: number) => number

/** How a link reads in print: "pauseai.info/join", not "https://pauseai.info/join/", and an email link as its address. */
export function displayLink(input: string): string {
	const url = normaliseUrl(input)
	if (!url) return ''
	if (/^mailto:/i.test(url)) return url.slice('mailto:'.length).split('?')[0]
	return url
		.replace(/^https?:\/\//i, '')
		.replace(/^www\./i, '')
		.replace(/\/$/, '')
}

/** Where the baseline sits inside a line box, as a share of the line height. */
const BASELINE_IN_LINE = 0.8

/**
 * Lays the caption out under a `size` px square code panel. Everything scales with `size`, so the preview, the SVG and
 * the PNG all wrap the same way.
 */
export function captionLayout(
	size: number,
	caption: QrCaption,
	measure: CaptionMeasure
): CaptionLayout {
	const label = caption.label.trim()
	const link = caption.link.trim()
	if (!label && !link) return { height: size, lines: [], overflow: false }

	// The code panel's own padding already leaves a gap under the code, so the caption starts right below the panel.
	const pad = size * QR_PANEL_PAD
	const maxWidth = size - pad * 2
	const lines: CaptionLine[] = []
	let overflow = false
	let y = size

	const block = (
		kind: CaptionKind,
		text: string,
		maxFont: number,
		minFont: number,
		maxLines: number
	) => {
		const lineHeight = 1.2
		const fit = fitText((t, f) => measure(kind, t, f), text, {
			maxWidth,
			maxHeight: maxFont * lineHeight * maxLines,
			maxFont,
			minFont,
			lineHeight
		})
		overflow ||= fit.overflow
		fit.lines.forEach((line, i) => {
			lines.push({
				kind,
				text: line,
				fontSize: fit.fontSize,
				baseline: y + (i + BASELINE_IN_LINE) * fit.lineHeightPx
			})
		})
		y += fit.height
	}

	if (label) block('label', label, size * 0.085, size * 0.05, 2)
	if (label && link) y += size * 0.01
	// Links have no spaces to wrap at, so they stay on one line and shrink instead.
	if (link) block('link', link, size * 0.055, size * 0.03, 1)

	return { height: Math.ceil(y + pad), lines, overflow }
}

const fontRules = new Map<string, Promise<string>>()

/** One subset's @font-face rule with the font inlined, fetched once. */
function inlineFace(face: CanvasFace): Promise<string> {
	let rule = fontRules.get(face.file)
	if (!rule) {
		rule = (async () => {
			const res = await fetch(face.file)
			if (!res.ok) throw new Error(`Could not load ${face.file}`)
			const bytes = new Uint8Array(await res.arrayBuffer())
			let binary = ''
			for (let i = 0; i < bytes.length; i += 0x8000)
				binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
			return `@font-face{font-family:"${face.family}";font-weight:${face.weight};unicode-range:${UNICODE_RANGES[face.subset]};src:url(data:font/woff2;base64,${btoa(binary)}) format("woff2");}`
		})()
		// Let a later call try again.
		rule.catch(() => fontRules.delete(face.file))
		fontRules.set(face.file, rule)
	}
	return rule
}

/** The caption faces that `caption`'s text needs: Latin always, and accented, Cyrillic or Greek letters when used. */
export function captionFaces(caption: QrCaption): CanvasFace[] {
	return (Object.keys(CAPTION_FONTS) as CaptionKind[])
		.filter((kind) => caption[kind].trim())
		.flatMap((kind) => {
			const { family, weight } = CAPTION_FONTS[kind]
			return facesFor(family, weight, caption[kind])
		})
}

/**
 * @font-face rules with the caption fonts inlined, for SVG downloads, so the text looks the same wherever the file is
 * opened. Only the subsets the caption uses, about 30 KB for English text, so they are only fetched once a caption is
 * used.
 */
export async function captionFontCss(caption: QrCaption): Promise<string> {
	const rules = await Promise.all(captionFaces(caption).map(inlineFace))
	return rules.join('')
}
