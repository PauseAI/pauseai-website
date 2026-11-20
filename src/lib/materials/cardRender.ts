/** Browser only: paints business card faces (laid out by businessCards.ts) into canvases. */
import {
	cardBox,
	layoutCardFace,
	type CardFace,
	type CardItem,
	type CardMeasure
} from './businessCards'
import { cardFontCss } from './cardFonts'
import { renderSize, type PrintFormat } from './formats'
import type { LintIssue } from './lint'
import { qrTarget } from './qr'
import { drawQr, type Drawable, type Values } from './templates'

export interface CardRenderOptions {
	format: PrintFormat
	face: CardFace
	values: Values
	/** The logo that reads on orange: white circle, black PAUSE. */
	logo: Drawable
	/** Include the 3 mm bleed, for the print PDF. */
	bleed?: boolean
	/** Scale down so the longest side is at most this many px. Used for the live preview. */
	maxSide?: number
}

/** Draws one face of a card into `canvas`, sizing the canvas to match, and returns any problems with it. */
export function renderCardFace(
	canvas: HTMLCanvasElement,
	opts: CardRenderOptions
): { issues: LintIssue[] } {
	const size = renderSize(opts.format, { bleed: opts.bleed })
	const scale = opts.maxSide ? Math.min(1, opts.maxSide / Math.max(size.width, size.height)) : 1
	const box = cardBox(opts.format, size, scale)
	canvas.width = box.width
	canvas.height = box.height
	const ctx = canvas.getContext('2d')
	if (!ctx) throw new Error('Canvas is not supported in this browser')
	const measure: CardMeasure = (text, px, font) => {
		ctx.font = cardFontCss(font, px)
		return ctx.measureText(text).width
	}
	const { items, issues } = layoutCardFace(opts.face, box, opts.values, measure)
	for (const item of items) paint(ctx, item, opts.logo)
	return { issues }
}

function paint(ctx: CanvasRenderingContext2D, item: CardItem, logo: Drawable) {
	switch (item.kind) {
		case 'rect':
			ctx.fillStyle = item.fill
			ctx.fillRect(item.x, item.y, item.w, item.h)
			return
		case 'text':
			ctx.font = cardFontCss(item.font, item.size)
			ctx.fillStyle = item.fill
			ctx.textAlign = 'left'
			ctx.textBaseline = 'alphabetic'
			if (item.maxWidth === undefined) ctx.fillText(item.text, item.x, item.y)
			else ctx.fillText(item.text, item.x, item.y, item.maxWidth)
			return
		case 'logo':
			ctx.drawImage(logo.source, item.x, item.y, item.w, item.h)
			return
		case 'qr':
			drawQr(ctx, qrTarget(item.url, false), item.x, item.y, item.size)
			return
		case 'mark': {
			const { cx, cy, r, barW, barH, barGap } = item
			const path = new Path2D()
			path.arc(cx, cy, r, 0, Math.PI * 2)
			path.rect(cx - barGap / 2 - barW, cy - barH / 2, barW, barH)
			path.rect(cx + barGap / 2, cy - barH / 2, barW, barH)
			ctx.save()
			ctx.globalAlpha = item.alpha
			ctx.fillStyle = item.fill
			ctx.fill(path, 'evenodd')
			ctx.restore()
			return
		}
	}
}

/** Both sides next to each other on one image, for sharing a preview of the card. */
export function cardPreviewCanvas(
	one: HTMLCanvasElement,
	two: HTMLCanvasElement
): HTMLCanvasElement {
	const gap = Math.round(one.height * 0.08)
	const canvas = document.createElement('canvas')
	canvas.width = one.width + two.width + gap * 3
	canvas.height = Math.max(one.height, two.height) + gap * 2
	const ctx = canvas.getContext('2d')
	if (!ctx) throw new Error('Canvas is not supported in this browser')
	ctx.fillStyle = '#E8E4DF'
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	ctx.drawImage(one, gap, gap)
	ctx.drawImage(two, one.width + gap * 2, gap)
	return canvas
}
