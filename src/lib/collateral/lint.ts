import {
	busySample,
	worstFailure,
	type Backdrop,
	type Rect,
	type Rgb,
	type TextSample
} from './contrast'

/** One problem the checks list shows beside Download. */
export interface LintIssue {
	/** Stable key, so the same problem is listed once. */
	id: string
	/** "warn" needs attention before printing or posting; "info" is worth a look. */
	level: 'warn' | 'info'
	message: string
	/**
	 * "design" when the problem is in the design itself (its text or QR codes), so it is the same on every format.
	 * The campaign pack lists those once rather than on each format. Left out when it depends on the format.
	 */
	scope?: 'design'
}

/** Smallest comfortable printed text, in points. */
const MIN_PRINT_PT = 7

/** Width of the photo copy the contrast checks read. Small, since it is read on every redraw. */
const BACKDROP_WIDTH = 200

/** How the photo is shown, for working out contrast at other tint steps. */
export interface PhotoContext {
	/** The style colour blended over the photo. */
	bg: Rgb
	/** Share of the photo showing through, as drawn. */
	visible: number
}

const snippet = (text: string) => {
	const t = text.trim()
	return t.length > 28 ? `${t.slice(0, 27).trimEnd()}…` : t
}

/**
 * Collects problems while a layout draws, plus the smallest text size drawn and the text over the photo,
 * so print sizes and contrast can be checked afterwards. Only the preview passes one: downloads skip it.
 */
export class LintCollector {
	readonly issues: LintIssue[] = []
	/** Smallest font drawn, in export pixels. */
	minTextPx = Infinity
	private backdrop: Backdrop | null = null
	private backdropScale = 1
	private photo: PhotoContext | null = null
	private samples: TextSample[] = []

	add(issue: LintIssue) {
		if (!this.issues.some((i) => i.id === issue.id)) this.issues.push(issue)
	}

	noteText(exportPx: number) {
		if (exportPx > 0 && exportPx < this.minTextPx) this.minTextPx = exportPx
	}

	/** Keeps a small untinted copy of the photo as drawn on `canvas`. Call after drawing the photo, before its tint. */
	captureBackdrop(canvas: HTMLCanvasElement, photo: PhotoContext) {
		const scale = Math.min(1, BACKDROP_WIDTH / canvas.width)
		const small = document.createElement('canvas')
		small.width = Math.max(1, Math.round(canvas.width * scale))
		small.height = Math.max(1, Math.round(canvas.height * scale))
		const ctx = small.getContext('2d', { willReadFrequently: true })
		if (!ctx) return
		ctx.drawImage(canvas, 0, 0, small.width, small.height)
		this.backdrop = {
			pixels: ctx.getImageData(0, 0, small.width, small.height).data,
			width: small.width,
			height: small.height
		}
		this.backdropScale = scale
		this.photo = photo
	}

	/** Records a line of text drawn over the photo. `rect` is in canvas pixels. Ignored when there is no photo. */
	noteTextBox(text: string, rect: Rect, rgb: Rgb | null, large: boolean, halo = 0) {
		if (!this.backdrop || !rgb || !text.trim()) return
		const k = this.backdropScale
		this.samples.push({
			text,
			rect: { x: rect.x * k, y: rect.y * k, w: rect.w * k, h: rect.h * k },
			rgb,
			large,
			halo
		})
	}

	/**
	 * Whether every line over the photo would pass its contrast check with `visible` of the photo showing, and,
	 * when `calm` is set, sit on a calm enough patch too. True when there is no photo or no text over it.
	 */
	readsAt(visible: number, calm: boolean): boolean {
		const { backdrop, photo, samples } = this
		if (!backdrop || !photo || samples.length === 0) return true
		if (worstFailure(backdrop, samples, photo.bg, visible)) return false
		return !calm || !busySample(backdrop, samples, photo.bg, visible)
	}

	/** Adds checks that need the whole drawing, then returns the issues, warnings first. */
	finish(dpi?: number): LintIssue[] {
		if (dpi && Number.isFinite(this.minTextPx)) {
			const pt = (this.minTextPx / dpi) * 72
			if (pt < MIN_PRINT_PT) {
				this.add({
					id: 'print-small-text',
					level: 'warn',
					message: `Some text prints at ${pt.toFixed(1)} pt, which is hard to read. Use less text or a bigger format.`
				})
			}
		}
		this.checkContrast()
		return [...this.issues].sort((a, b) => (a.level === b.level ? 0 : a.level === 'warn' ? -1 : 1))
	}

	private checkContrast() {
		const { backdrop, photo, samples } = this
		if (!backdrop || !photo || samples.length === 0) return

		const failure = worstFailure(backdrop, samples, photo.bg, photo.visible)
		if (failure) {
			this.add({
				id: 'contrast',
				level: 'warn',
				// The colour over the photo is already the strongest that helps (see renderCollateral), so the fix is the photo or style.
				message: `“${snippet(failure.sample.text)}” may be hard to read. Try adjusting the image so the text sits on a plainer part, or try a different image or style.`
			})
			return
		}
		const busy = busySample(backdrop, samples, photo.bg, photo.visible)
		if (busy) {
			this.add({
				id: 'busy-background',
				level: 'info',
				message: `“${snippet(busy.text)}” sits on a busy part of the image. Try adjusting the image so the text sits on a plainer part.`
			})
		}
	}
}

/**
 * Something that reads as a web address: a scheme, "www.", or a name ending in a common top-level domain,
 * optionally with a path. The domain list keeps "e.g." or "3.5" from matching.
 */
const LINK =
	/\b(?:https?:\/\/\S+|www\.\S+|[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|org|net|uk|io|ai|cc|me|ly|ma|gg|info|link|app|dev|eu|to|co|de|fr|nl|es|it|pl|ca|au|cz|ro|rs|se|ch|be|at|dk|no|fi|ie|pt|br|nz|za|ke)(?:\/\S*)?)(?=[\s,;)!?]|\.?$)/i

/** The first link found in `text`, without trailing punctuation, or null. */
export function findLink(text: string): string | null {
	const m = LINK.exec(text)
	return m ? m[0].replace(/[.,;:)]+$/, '') : null
}

/**
 * Flags links typed into text fields other than the web address. On an image a link cannot be clicked,
 * and in running text it is easy to misread, so it belongs in Web address or a QR code.
 */
export function lintLinksInText(
	lint: LintCollector,
	fields: { key: string; label: string; kind: string }[],
	values: Record<string, string>
) {
	for (const field of fields) {
		if (field.key === 'url' || (field.kind !== 'text' && field.kind !== 'textarea')) continue
		const link = findLink(values[field.key] ?? '')
		if (!link) continue
		lint.add({
			id: `link-in-${field.key}`,
			level: 'warn',
			scope: 'design',
			message: `${field.label} contains a link (${link}). A link cannot be clicked on an image, so put it in Web address or a QR code instead.`
		})
	}
}

/**
 * Splits several formats' checks into problems with the design itself, listed once whichever formats reported
 * them, and each format's own problems.
 */
export function splitByScope(perFormat: LintIssue[][]): {
	design: LintIssue[]
	own: LintIssue[][]
} {
	const design: LintIssue[] = []
	for (const issue of perFormat.flat()) {
		if (issue.scope === 'design' && !design.some((d) => d.id === issue.id)) design.push(issue)
	}
	return { design, own: perFormat.map((issues) => issues.filter((i) => i.scope !== 'design')) }
}

/** Hosts whose links are codes rather than words: link shorteners and meeting links. */
const CODE_LINK_HOSTS = [
	'bit.ly',
	'tinyurl.com',
	'tiny.cc',
	't.co',
	'ow.ly',
	'buff.ly',
	'rb.gy',
	'is.gd',
	'cutt.ly',
	'shorturl.at',
	'forms.gle',
	'goo.gl',
	'zoom.us',
	'meet.google.com',
	// Group chat invites, which some chapters use as their link.
	'chat.whatsapp.com'
]

/** Our Luma calendar names, which sit where an event id would but are fine to print. */
const READABLE_LUMA_PATHS = ['pauseai.uk', 'pauseai']

function hostAndPath(url: string): { host: string; path: string[] } | null {
	try {
		const u = new URL(/^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`)
		return {
			host: u.hostname.toLowerCase().replace(/^www\./, ''),
			path: u.pathname.split('/').filter(Boolean)
		}
	} catch {
		return null
	}
}

function lumaEventId(url: string): string | null {
	const parts = hostAndPath(url)
	if (!parts || !['lu.ma', 'luma.com'].includes(parts.host) || parts.path.length !== 1) return null
	const id = parts.path[0].toLowerCase()
	return READABLE_LUMA_PATHS.includes(id) ? null : id
}

/** A Luma event's own page, e.g. lu.ma/eoohwufh or lu.ma/pauseai-c9wb, as opposed to our calendar. */
export function isLumaEventLink(url: string): boolean {
	return lumaEventId(url) !== null
}

/**
 * A Luma id that is a code: letters and digits only (eoohwufh), or ending in a part with a digit in it (pauseai-c9wb).
 * Chosen names like lu.ma/pauseai-protest read fine.
 */
const RANDOM_LUMA_ID = /^[a-z0-9]{6,12}$|-[a-z0-9]*\d[a-z0-9]*$/

/** True for links that are codes nobody can read or type: shorteners, meeting links and Luma event ids. */
export function isUnreadableLink(url: string): boolean {
	const parts = hostAndPath(url)
	if (!parts || parts.path.length === 0) return false
	const lumaId = lumaEventId(url)
	return CODE_LINK_HOSTS.includes(parts.host) || (lumaId !== null && RANDOM_LUMA_ID.test(lumaId))
}

/** Flags a printed web address that is a code: it belongs in a QR code, with a readable link printed instead. */
export function lintUnreadableUrl(lint: LintCollector, values: Record<string, string>) {
	const url = values.url?.trim()
	if (!url || !isUnreadableLink(url)) return
	lint.add({
		id: 'url-unreadable',
		level: 'info',
		scope: 'design',
		message: `The web address ${url} is a code that is hard to read or type. Put it in a QR code, and print a readable link such as pauseai.info/events instead.`
	})
}

export function sameIssues(a: LintIssue[], b: LintIssue[]): boolean {
	return (
		a.length === b.length &&
		a.every((issue, i) => issue.id === b[i].id && issue.message === b[i].message)
	)
}
