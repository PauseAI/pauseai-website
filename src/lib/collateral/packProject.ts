import { clampHeadlineScale } from './design'
import { FORMATS } from './formats'
import type { PhotoView } from './photoTransform'
import { isRecord, parseDesignData, parsePhotoView, type DesignData } from './project'

const PACK_PROJECT_APP = 'pauseai-collateral-pack'
const PACK_PROJECT_VERSION = 1

/** The formats ticked for a new pack: the usual set for promoting an event. */
export const DEFAULT_PACK_FORMAT_IDS = [
	'a5',
	'ig-square',
	'story',
	'luma-cover',
	'fb-event',
	'x-header'
]

/** One format in the pack, with the adjustments made to it alone. */
export interface PackOutput {
	formatId: string
	/** The photo crop for this format, since each shape needs its own. */
	photoView: PhotoView
	headlineScale: number
	/** Whether QR codes show on this format when it is a screen format, where they are left out by default. */
	screenQr: boolean
}

/** Everything needed to reopen a campaign pack. Plain data, so it can be saved as JSON. */
export interface PackProject extends DesignData {
	/** The ticked formats, in the order of the format list. */
	outputs: PackOutput[]
}

export const DEFAULT_PHOTO_VIEW: PhotoView = { zoom: 1, focalX: 0.5, focalY: 0.5 }

export function newPackOutput(formatId: string): PackOutput {
	return { formatId, photoView: { ...DEFAULT_PHOTO_VIEW }, headlineScale: 1, screenQr: false }
}

export function serializePackProject(project: PackProject, now = new Date()): string {
	return JSON.stringify(
		{
			app: PACK_PROJECT_APP,
			version: PACK_PROJECT_VERSION,
			savedAt: now.toISOString(),
			...project
		},
		null,
		2
	)
}

export type PackParseResult = { ok: true; project: PackProject } | { ok: false; error: string }

/** Reads a saved pack. Forgiving about content and strict about shape, since the file is untrusted input. */
export function parsePackProject(text: string): PackParseResult {
	let raw: unknown
	try {
		raw = JSON.parse(text)
	} catch {
		return { ok: false, error: 'That file is not a saved campaign pack.' }
	}
	if (!isRecord(raw) || raw.app !== PACK_PROJECT_APP) {
		return { ok: false, error: 'That file is not a saved campaign pack.' }
	}
	if (typeof raw.version !== 'number' || raw.version > PACK_PROJECT_VERSION) {
		return { ok: false, error: 'This pack was saved by a newer version of the tool.' }
	}

	const byId = new Map<string, PackOutput>()
	for (const o of Array.isArray(raw.outputs) ? raw.outputs.filter(isRecord) : []) {
		const formatId = typeof o.formatId === 'string' ? o.formatId : ''
		if (!FORMATS.some((f) => f.id === formatId) || byId.has(formatId)) continue
		byId.set(formatId, {
			formatId,
			photoView: parsePhotoView(o.photoView),
			headlineScale: clampHeadlineScale(o.headlineScale),
			screenQr: o.screenQr === true
		})
	}
	const outputs = FORMATS.filter((f) => byId.has(f.id)).map((f) => byId.get(f.id)!)

	return { ok: true, project: { ...parseDesignData(raw), outputs } }
}
