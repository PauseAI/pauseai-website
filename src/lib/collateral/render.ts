/** Browser only: draws the collateral into canvases. */
import { declareCanvasFonts, facesFor } from './canvasFonts'
import { PHOTO_TINTS, type QrSize } from './design'
import { renderSize, showsQrCodes, type Format } from './formats'
import { LintCollector, lintLinksInText, lintUnreadableUrl, type LintIssue } from './lint'
import {
	drawLogoCover,
	FONT_FACES,
	type DrawArgs,
	type Drawable,
	type PhotoSettings,
	type Template,
	type Values
} from './templates'
import type { QrCode } from './qr'
import type { Theme } from './themes'

/**
 * Loads the layouts' fonts before drawing, as a canvas draws text in a fallback font while its face is still loading.
 * Pass the design's text, so the subsets it needs (accented, Cyrillic or Greek letters) load too, not only Latin.
 */
export async function loadFonts(text = ''): Promise<void> {
	declareCanvasFonts()
	// One load per face covers every subset of it that the text needs.
	const loads = FONT_FACES.filter(
		({ family, weight }) => facesFor(family, weight, text).length
	).map(({ family, weight }) => document.fonts.load(`${weight} 40px "${family}"`, `${text}A`))
	await Promise.all(loads)
}

const imageCache = new Map<string, Promise<Drawable>>()

function decodeImage(src: string): Promise<Drawable> {
	return new Promise<Drawable>((resolve, reject) => {
		const img = new Image()
		img.onload = () => resolve({ source: img, width: img.naturalWidth, height: img.naturalHeight })
		img.onerror = () => reject(new Error('Could not load the image'))
		img.src = src
	})
}

/** Loads a same-origin image (logo or library photo). Cached so redraws stay instant. */
export function loadImage(src: string): Promise<Drawable> {
	let cached = imageCache.get(src)
	if (!cached) {
		cached = decodeImage(src)
		imageCache.set(src, cached)
		// A failed load (a network blip, say) is not kept, so the next try loads it again.
		cached.catch(() => imageCache.delete(src))
	}
	return cached
}

/** Loads a photo embedded in a saved project. Not cached, since the string is large. */
export function loadDataUrl(dataUrl: string): Promise<Drawable> {
	return decodeImage(dataUrl)
}

/** Downscales a photo and encodes it as a JPEG data URL, so a saved project stays a reasonable size. */
export function drawableToJpegDataUrl(photo: Drawable, maxSide = 2400, quality = 0.9): string {
	const scale = Math.min(1, maxSide / Math.max(photo.width, photo.height))
	const canvas = document.createElement('canvas')
	canvas.width = Math.max(1, Math.round(photo.width * scale))
	canvas.height = Math.max(1, Math.round(photo.height * scale))
	const ctx = canvas.getContext('2d')
	if (!ctx) throw new Error('Canvas is not supported in this browser')
	// JPEG has no transparency, so put PNG cut-outs on white rather than black.
	ctx.fillStyle = '#FFFFFF'
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	ctx.drawImage(photo.source, 0, 0, canvas.width, canvas.height)
	return canvas.toDataURL('image/jpeg', quality)
}

/** Reads a volunteer's uploaded photo. It never leaves the browser. */
export async function fileToDrawable(file: File): Promise<Drawable> {
	const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
	return { source: bitmap, width: bitmap.width, height: bitmap.height }
}

export interface RenderOptions {
	format: Format
	template: Template
	theme: Theme
	values: Values
	/** The country the design is for, as its header shows it. Empty or left out for PauseAI as a whole. */
	country?: string
	logo: Drawable
	photo: Drawable | null
	/** Photo zoom and position. Leave `visible` out to pick the colour over the photo automatically (see autoPhotoVisible). */
	photoSettings: Omit<PhotoSettings, 'visible'> & { visible?: number }
	qrCodes: QrCode[]
	trackQr: boolean
	qrSize?: QrSize
	headlineScale?: number
	partnerLogos?: Drawable[]
	/** Show QR codes on a screen format, where they are left out by default (see showsQrCodes). */
	screenQr?: boolean
	/** Leave the photo untinted on a logo cover (see DigitalFormat.logoCover). Other formats always tint it. */
	photoClear?: boolean
	/** Draw the title on a logo cover. */
	coverTitle?: boolean
	/** The logo for an untinted photo (CLEAR_PHOTO_LOGO_SRC), since the style's own may be dark lettering. */
	clearPhotoLogo?: Drawable
	/** Include bleed (print formats only). */
	bleed?: boolean
	/** Scale output down so its longest side is at most this many px. Used for the live preview. */
	maxSide?: number
	/** Collect problems for the checks list. The live preview asks; downloads do not. */
	lint?: boolean
}

type DrawOptions = RenderOptions & { photoSettings: PhotoSettings }

/** Size of the draw that picks the colour over the photo. Small, since it runs before every redraw. */
const TINT_PROBE_MAX_SIDE = 600

/**
 * The lightest tint step whose text reads well over the photo: first one where every line passes and none sits on
 * a busy patch, then one where every line passes, then the strongest. One small draw is enough, since the text
 * boxes and the untinted photo behind them do not change with the tint.
 */
function autoPhotoVisible(opts: RenderOptions): number {
	const steps = PHOTO_TINTS.map((t) => t.visible)
	if (!opts.photo) return steps[0]
	const lint = new LintCollector()
	const maxSide = Math.min(opts.maxSide ?? Infinity, TINT_PROBE_MAX_SIDE)
	draw(
		document.createElement('canvas'),
		{ ...opts, maxSide, photoSettings: { ...opts.photoSettings, visible: steps[0] } },
		lint
	)
	return (
		steps.find((v) => lint.readsAt(v, true)) ??
		steps.find((v) => lint.readsAt(v, false)) ??
		steps[steps.length - 1]
	)
}

/**
 * What the format actually shows: nothing to point people to on a page they are already on (the Luma cover), and
 * QR codes on screen formats only when asked for.
 */
function forFormat(opts: RenderOptions): RenderOptions {
	const { format } = opts
	if (format.kind === 'digital' && format.onPage)
		return { ...opts, values: { ...opts.values, cta: '', url: '' }, qrCodes: [] }
	return showsQrCodes(format, opts.screenQr ?? false) ? opts : { ...opts, qrCodes: [] }
}

function isLogoCover(format: Format): boolean {
	return format.kind === 'digital' && !!format.logoCover
}

/** Draws the collateral into `canvas`, sizing the canvas to match. Returns the final pixel size, and any problems when asked. */
export function renderCollateral(
	canvas: HTMLCanvasElement,
	requested: RenderOptions
): { width: number; height: number; issues: LintIssue[] } {
	const opts = forFormat(requested)
	const visible =
		isLogoCover(opts.format) && opts.photoClear
			? 1
			: (opts.photoSettings.visible ?? autoPhotoVisible(opts))
	const drawn: DrawOptions = { ...opts, photoSettings: { ...opts.photoSettings, visible } }
	const lint = drawn.lint ? new LintCollector() : undefined
	const size = draw(canvas, drawn, lint)
	return { width: size.width, height: size.height, issues: lint ? lint.finish(size.dpi) : [] }
}

function draw(
	canvas: HTMLCanvasElement,
	opts: DrawOptions,
	lint: LintCollector | undefined
): { width: number; height: number; dpi?: number } {
	const size = renderSize(opts.format, { bleed: opts.bleed })
	const scale = opts.maxSide ? Math.min(1, opts.maxSide / Math.max(size.width, size.height)) : 1
	const width = Math.max(1, Math.round(size.width * scale))
	const height = Math.max(1, Math.round(size.height * scale))
	canvas.width = width
	canvas.height = height
	const ctx = canvas.getContext('2d')
	if (!ctx) throw new Error('Canvas is not supported in this browser')
	const args: DrawArgs = {
		ctx,
		width,
		height,
		bleedPx: Math.round(size.bleedPx * scale),
		safeLeft: opts.format.kind === 'digital' ? opts.format.safeLeft : undefined,
		scale,
		dpi: size.dpi,
		theme: opts.theme,
		values: opts.values,
		country: opts.country,
		logo: opts.logo,
		photo: opts.photo,
		photoSettings: opts.photoSettings,
		qrCodes: opts.qrCodes,
		trackQr: opts.trackQr,
		qrSize: opts.qrSize,
		headlineScale: opts.headlineScale,
		partnerLogos: opts.partnerLogos,
		lint
	}
	if (isLogoCover(opts.format)) {
		const clear = opts.photo && opts.photoSettings.visible >= 1
		drawLogoCover(
			{ ...args, logo: (clear && opts.clearPhotoLogo) || args.logo },
			opts.coverTitle ? (opts.values.headline ?? '') : ''
		)
		return { width, height, dpi: size.dpi }
	}
	opts.template.draw(args)
	if (lint) {
		lintLinksInText(lint, opts.template.fields, opts.values)
		lintUnreadableUrl(lint, opts.values)
	}
	return { width, height, dpi: size.dpi }
}

/** Downscales a partner logo and encodes it as a PNG data URL, keeping transparency, so it can be saved with a project. */
export function drawableToPngDataUrl(image: Drawable, maxSide = 600): string {
	const scale = Math.min(1, maxSide / Math.max(image.width, image.height))
	const canvas = document.createElement('canvas')
	canvas.width = Math.max(1, Math.round(image.width * scale))
	canvas.height = Math.max(1, Math.round(image.height * scale))
	const ctx = canvas.getContext('2d')
	if (!ctx) throw new Error('Canvas is not supported in this browser')
	ctx.drawImage(image.source, 0, 0, canvas.width, canvas.height)
	return canvas.toDataURL('image/png')
}
