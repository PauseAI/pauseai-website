import { clampHeadlineScale, isQrSize, MAX_PARTNER_LOGOS, type QrSize } from './design'
import { DATE_INPUT, TIME_INPUT } from './eventText'
import { getFormat } from './formats'
import { LIBRARY_PHOTOS } from './photos'
import { MAX_ZOOM, type PhotoView } from './photoTransform'
import { MAX_QR_CODES, type QrCode } from './qr'
import { TEMPLATES, getTemplate, type FieldDef, type Values } from './templates'
import { getChapter } from './chapters'
import { getTheme } from './themes'

const PROJECT_APP = 'pauseai-collateral'
const PROJECT_VERSION = 1
export const QR_LABEL_MAX = 32
export const QR_URL_MAX = 200
/** Uploaded photos are embedded in the file, so cap what a file may carry. */
export const MAX_EMBEDDED_PHOTO_CHARS = 8_000_000

export type ProjectPhoto =
	{ kind: 'library'; id: string } | { kind: 'upload'; name: string; dataUrl: string }

/** A partner organisation's logo, embedded in the file like an uploaded photo. */
export interface PartnerLogoData {
	name: string
	/** PNG, JPEG or WebP data URL. */
	dataUrl: string
}

/** A partner logo is downscaled before saving, so a much bigger one is not a logo. */
const MAX_PARTNER_LOGO_CHARS = 1_500_000

/** What a design says and how it looks, apart from where it goes. Shared by single-image and campaign pack projects. */
export interface DesignData {
	/** The national chapter the design is for (see chapters.ts), or empty for PauseAI as a whole. */
	chapterId: string
	templateId: string
	themeId: string
	/** Text fields, kept per layout so switching layouts does not lose what was typed. */
	values: Record<string, Values>
	/** QR codes, kept per layout like the text, so codes added on one layout do not turn up on another. */
	qrCodes: Record<string, QrCode[]>
	trackQr: boolean
	qrSize: QrSize
	photo: ProjectPhoto | null
	/** Leave the photo untinted on a logo cover, such as the Luma cover. Other formats always tint it. */
	photoClear: boolean
	/** Show the title on a logo cover. */
	coverTitle: boolean
	partnerLogos: PartnerLogoData[]
}

/** Everything needed to reopen a single-image design. Plain data, so it can be saved as JSON. */
export interface Project extends DesignData {
	formatId: string
	/** Photo zoom and position. The colour over the photo is picked when drawing, so it is not saved. */
	photoSettings: PhotoView
	headlineScale: number
	/** Whether QR codes show when the format is a screen format, where they are left out by default. */
	screenQr: boolean
}

export function serializeProject(project: Project, now = new Date()): string {
	return JSON.stringify(
		{ app: PROJECT_APP, version: PROJECT_VERSION, savedAt: now.toISOString(), ...project },
		null,
		2
	)
}

export type ParseResult = { ok: true; project: Project } | { ok: false; error: string }

export const isRecord = (v: unknown): v is Record<string, unknown> =>
	typeof v === 'object' && v !== null && !Array.isArray(v)
export const str = (v: unknown, max: number): string =>
	typeof v === 'string' ? v.slice(0, max) : ''
const num = (v: unknown, lo: number, hi: number, fallback: number): number =>
	typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fallback

/** Validates a photo reference from untrusted saved JSON, shared by single-image and gallery projects. */
export function parseProjectPhoto(raw: unknown): ProjectPhoto | null {
	if (!isRecord(raw)) return null
	if (raw.kind === 'library' && LIBRARY_PHOTOS.some((p) => p.id === raw.id)) {
		return { kind: 'library', id: raw.id as string }
	}
	if (
		raw.kind === 'upload' &&
		typeof raw.dataUrl === 'string' &&
		// Raster formats only. SVG data URLs are not accepted.
		/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(raw.dataUrl) &&
		raw.dataUrl.length <= MAX_EMBEDDED_PHOTO_CHARS
	) {
		return { kind: 'upload', name: str(raw.name, 120) || 'Uploaded photo', dataUrl: raw.dataUrl }
	}
	return null
}

/** Validates a saved photo zoom and position, shared by every kind of project. Older files also hold `visible`, which is ignored. */
export function parsePhotoView(raw: unknown): PhotoView {
	const ps = isRecord(raw) ? raw : {}
	return {
		zoom: num(ps.zoom, 1, MAX_ZOOM, 1),
		focalX: num(ps.focalX, 0, 1, 0.5),
		focalY: num(ps.focalY, 0, 1, 0.5)
	}
}

/**
 * Reads a saved file. It is deliberately forgiving about content (unknown ids fall back to
 * defaults, long text is trimmed) and strict about shape, since the file is untrusted input.
 */
export function parseProject(text: string): ParseResult {
	let raw: unknown
	try {
		raw = JSON.parse(text)
	} catch {
		return { ok: false, error: 'That file is not a saved collateral project.' }
	}
	if (!isRecord(raw) || raw.app !== PROJECT_APP) {
		return { ok: false, error: 'That file is not a saved collateral project.' }
	}
	if (typeof raw.version !== 'number' || raw.version > PROJECT_VERSION) {
		return { ok: false, error: 'This project was saved by a newer version of the tool.' }
	}

	return {
		ok: true,
		project: {
			...parseDesignData(raw),
			formatId: getFormat(str(raw.formatId, 40)).id,
			photoSettings: parsePhotoView(raw.photoSettings),
			headlineScale: clampHeadlineScale(raw.headlineScale),
			screenQr: raw.screenQr === true
		}
	}
}

/** Date and time fields hold what their inputs give, or nothing. Free text from older saves falls back to the default. */
function fitsKind(kind: FieldDef['kind'], value: string): boolean {
	if (kind === 'date') return value === '' || DATE_INPUT.test(value)
	if (kind === 'time') return value === '' || TIME_INPUT.test(value)
	return true
}

/**
 * Validates the design fields of a saved file from untrusted JSON. Fields added after a file was saved get their
 * defaults. Settings the tool no longer offers (alignment, colour strength, small QR codes) are dropped.
 */
export function parseDesignData(raw: Record<string, unknown>): DesignData {
	const values: Record<string, Values> = {}
	const rawValues = isRecord(raw.values) ? raw.values : {}
	for (const template of TEMPLATES) {
		const saved = rawValues[template.id]
		if (!isRecord(saved)) continue
		values[template.id] = Object.fromEntries(
			template.fields
				.filter((f) => typeof saved[f.key] === 'string' && fitsKind(f.kind, saved[f.key] as string))
				.map((f) => [f.key, str(saved[f.key], f.maxLength ?? 200)])
		)
	}

	const templateId = getTemplate(str(raw.templateId, 40)).id
	const parseCodes = (list: unknown): QrCode[] =>
		Array.isArray(list)
			? list
					.filter(isRecord)
					.slice(0, MAX_QR_CODES)
					.map((c) => ({ label: str(c.label, QR_LABEL_MAX), url: str(c.url, QR_URL_MAX) }))
			: []
	const qrCodes: Record<string, QrCode[]> = {}
	if (Array.isArray(raw.qrCodes)) {
		// Older files kept one list for every layout. It belongs to the layout the file was saved on.
		const codes = parseCodes(raw.qrCodes)
		if (codes.length) qrCodes[templateId] = codes
	} else if (isRecord(raw.qrCodes)) {
		for (const template of TEMPLATES) {
			const codes = parseCodes(raw.qrCodes[template.id])
			if (codes.length) qrCodes[template.id] = codes
		}
	}

	const partnerLogos: PartnerLogoData[] = Array.isArray(raw.partnerLogos)
		? raw.partnerLogos
				.filter(isRecord)
				.filter(
					(l) =>
						typeof l.dataUrl === 'string' &&
						// Raster formats only. SVG data URLs are not accepted.
						/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(l.dataUrl) &&
						l.dataUrl.length <= MAX_PARTNER_LOGO_CHARS
				)
				.slice(0, MAX_PARTNER_LOGOS)
				.map((l) => ({ name: str(l.name, 120) || 'Partner logo', dataUrl: l.dataUrl as string }))
		: []

	return {
		// Unknown chapters (renamed, or files from elsewhere) fall back to PauseAI as a whole.
		chapterId: getChapter(str(raw.chapterId, 80)).id,
		templateId,
		themeId: getTheme(str(raw.themeId, 40)).id,
		values,
		qrCodes,
		// Off unless a file explicitly turns it on. Tagging is currently disabled in qrTarget anyway.
		trackQr: raw.trackQr === true,
		qrSize: isQrSize(raw.qrSize) ? raw.qrSize : 'm',
		photo: parseProjectPhoto(raw.photo),
		photoClear: raw.photoClear === true,
		coverTitle: raw.coverTitle !== false,
		partnerLogos
	}
}
