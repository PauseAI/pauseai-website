import qrcode from 'qrcode-generator'
import type { QrSize } from './design'
import { aspectClass, layoutMarginUnits } from './formats'

export interface QrCode {
	label: string
	url: string
}

export const MAX_QR_CODES = 4

/** An email address alone, like "hello@pauseai.info". */
const EMAIL = /^[^\s@/?#:]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i

/**
 * Adds https:// when a volunteer types a bare address like "pauseai.info/communities", and mailto: when they type an email
 * address like "hello@pauseai.info".
 */
export function normaliseUrl(input: string): string {
	const trimmed = input.trim()
	if (!trimmed) return ''
	if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) return trimmed
	return EMAIL.test(trimmed) ? `mailto:${trimmed}` : `https://${trimmed}`
}

/**
 * Whether `input` is an email link a phone can open: an email address, alone or after mailto:, which may be followed
 * by a subject or body, like "mailto:hello@pauseai.info?subject=Flyers".
 */
export function isEmailLink(input: string): boolean {
	const trimmed = input.trim()
	if (/\s/.test(trimmed)) return false
	const url = normaliseUrl(trimmed)
	return /^mailto:/i.test(url) && EMAIL.test(url.slice('mailto:'.length).split('?')[0])
}

/** Whether `input` is something a QR code can open: a web address or an email link. */
export function isQrLink(input: string): boolean {
	return isWebAddress(input) || isEmailLink(input)
}

/**
 * Whether `input` looks like a web address a phone can open: no spaces, and a host name with a dot in it, like
 * "pauseai.info/join". Catches typos and pasted sentences before they become a code that goes nowhere.
 */
export function isWebAddress(input: string): boolean {
	const trimmed = input.trim()
	if (!trimmed || /\s/.test(trimmed)) return false
	try {
		const { hostname, username } = new URL(normaliseUrl(trimmed))
		// A user name means something like "mailto:someone@example.com" was read as a login.
		return !username && /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(hostname)
	} catch {
		return false
	}
}

/**
 * The address a QR code should open.
 *
 * UTM tagging is switched off for now, because we have no way to read the results yet.
 * The `track` argument is kept so callers do not change, and is ignored. To bring it back,
 * restore the block below and the "Tag the links" toggles in the two tool pages.
 */
export function qrTarget(input: string, track: boolean): string {
	void track
	return normaliseUrl(input)
	// const url = normaliseUrl(input);
	// if (!url || !track) return url;
	// const [base, hash] = url.split("#");
	// const sep = base.includes("?") ? "&" : "?";
	// return `${base}${sep}utm_source=collateral&utm_medium=qr${hash ? `#${hash}` : ""}`;
}

/** A safe download name for a code, e.g. "pauseai-info-join". */
export function qrFilenameStem(input: string): string {
	const url = normaliseUrl(input)
	let text = url
	try {
		const u = new URL(url)
		text = `${u.hostname}${u.pathname}`
	} catch {
		// Keep the raw text and clean it below.
	}
	const slug = text
		.toLowerCase()
		.replace(/^www\./, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 40)
	return slug || 'code'
}

/** Smallest comfortable printed width in mm: at least 25, and bigger for denser codes. */
export function qrMinPrintMm(modules: number): number {
	return Math.max(QR_MIN_PRINT_MM, Math.ceil(modules * 0.55))
}

/** Smallest comfortable on-screen width in px, counting the quiet margin. */
export function qrMinScreenPx(modules: number): number {
	return Math.ceil((QR_MIN_MODULE_PX * modules) / (1 - 2 * QR_PANEL_PAD))
}

/** Codes that have an address. Empty rows are ignored. */
export function usableQrCodes(codes: QrCode[]): QrCode[] {
	return codes.filter((c) => c.url.trim()).slice(0, MAX_QR_CODES)
}

// Scannability heuristics, measured at export size.
/** Each dark/light module needs at least this many pixels on a screen. */
export const QR_MIN_MODULE_PX = 5
/** Printed codes should be at least this wide (about 25 mm scans from arm's length). */
export const QR_MIN_PRINT_MM = 25
/** One QR may take this share of the shorter side of the design, several share a smaller cap. */
export const QR_MAX_SHARE_SINGLE = 0.32
export const QR_MAX_SHARE_MULTI = 0.26
/** Quiet padding inside the white panel, as a share of its size, on each side. */
export const QR_PANEL_PAD = 0.07
/** Gap between side-by-side codes, in design units. */
const QR_GAP_UNITS = 24

export interface QrPlan {
	ok: boolean
	/** Panel size in export pixels when `ok`. All codes share it. */
	size: number
	/** How many of the codes fit. Always the first `shown` in the list. */
	shown: number
	/** Why nothing is drawn, or a warning when only some are. */
	reason?: string
}

/**
 * Decides how many QR codes fit and how big they are. It aims for a comfortable
 * default size per layout, grows it to the minimum scannable size, and drops
 * codes from the end (or all of them, on e.g. an X header) when the minimum
 * would crowd the design.
 */
export function qrPlan(opts: {
	/** Export pixel size of the trimmed design. */
	width: number
	height: number
	/** Set for print formats. */
	dpi?: number
	urls: string[]
	track: boolean
	/** The volunteer's preferred size. Medium when left out. */
	sizePref?: QrSize
}): QrPlan {
	const targets = opts.urls
		.map((u) => qrTarget(u, opts.track))
		.filter(Boolean)
		.slice(0, MAX_QR_CODES)
	if (targets.length === 0)
		return { ok: false, size: 0, shown: 0, reason: 'Add a web address to make a QR code.' }

	const modules = targets.map((t) => qrMatrix(t).length)
	const u = Math.sqrt(opts.width * opts.height) / 1000
	const cls = aspectClass(opts.width, opts.height)
	const sizeScale = opts.sizePref === 'l' ? 1.3 : 1
	const preferred = (cls === 'banner' ? 150 : cls === 'story' ? 250 : 210) * u * sizeScale
	// Large may also take a bigger share of the design than the usual cap.
	const shareScale = opts.sizePref === 'l' ? 1.25 : 1
	const contentWidth = opts.width - 2 * layoutMarginUnits(cls) * u
	const gap = QR_GAP_UNITS * u
	const short = Math.min(opts.width, opts.height)
	const byPhysical = opts.dpi ? (QR_MIN_PRINT_MM / 25.4) * opts.dpi : 0

	for (let k = targets.length; k >= 1; k--) {
		const widest = Math.max(...modules.slice(0, k))
		const min = Math.ceil(
			Math.max((QR_MIN_MODULE_PX * widest) / (1 - 2 * QR_PANEL_PAD), byPhysical)
		)
		const cap = Math.min(
			short * (k === 1 ? QR_MAX_SHARE_SINGLE : QR_MAX_SHARE_MULTI) * shareScale,
			(contentWidth - (k - 1) * gap) / k
		)
		// Only the scannable minimum can rule a QR out. The preferred size is just clamped to the cap.
		if (min <= cap) {
			return {
				ok: true,
				size: Math.round(Math.min(Math.max(preferred, min), cap)),
				shown: k,
				reason:
					k < targets.length
						? `Only ${k} of ${targets.length} QR codes fit at a scannable size on this format.`
						: undefined
			}
		}
	}
	return {
		ok: false,
		size: 0,
		shown: 0,
		reason: 'Too small to scan at this size, so it is hidden. Try a bigger format.'
	}
}

/** Dark-module matrix. Uses the highest error correction so a logo can sit in the middle. */
export function qrMatrix(text: string): boolean[][] {
	const qr = qrcode(0, 'H')
	qr.addData(text)
	qr.make()
	const n = qr.getModuleCount()
	return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => qr.isDark(r, c)))
}
