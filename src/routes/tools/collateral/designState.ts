import type { QrSize } from '$lib/collateral/design'
import { LIBRARY_PHOTOS } from '$lib/collateral/photos'
import type { DesignData, PartnerLogoData, ProjectPhoto } from '$lib/collateral/project'
import type { QrCode } from '$lib/collateral/qr'
import { drawableToJpegDataUrl, loadDataUrl, loadImage } from '$lib/collateral/render'
import {
	DEFAULT_TEMPLATE_ID,
	defaultValues,
	getTemplate,
	TEMPLATES,
	type Drawable,
	type Template,
	type Values
} from '$lib/collateral/templates'
import { DEFAULT_THEME_ID } from '$lib/collateral/themes'
import { chapterFieldDefaults, getChapter } from '$lib/collateral/chapters'

// Caption is a gallery slide (photo-forward, no logo), so single designs offer the other layouts.
const HIDDEN_TEMPLATE_IDS = ['caption']
// Event goes last, so "fill in from one of our events" can sit right under it (see DesignControls).
export const DESIGN_TEMPLATES = TEMPLATES.filter((t) => !HIDDEN_TEMPLATE_IDS.includes(t.id)).sort(
	(a, b) => Number(a.id === 'event') - Number(b.id === 'event')
)

export interface PhotoState {
	drawable: Drawable
	name: string
	source: { kind: 'library'; id: string } | { kind: 'upload' }
}

export interface PartnerLogoState extends PartnerLogoData {
	drawable: Drawable
}

/** A design as the editor holds it: DesignData with images loaded. Shared by Single image and Campaign pack. */
export interface DesignState {
	/** The national chapter the design is for, or empty for PauseAI as a whole. Sets the header and some defaults. */
	chapterId: string
	templateId: string
	themeId: string
	valuesByTemplate: Record<string, Values>
	/** QR codes per layout, like the text. Read and write the current layout's with designQrCodes and withQrCodes. */
	qrCodesByTemplate: Record<string, QrCode[]>
	trackQr: boolean
	qrSize: QrSize
	photo: PhotoState | null
	/** See DesignData.photoClear. */
	photoClear: boolean
	/** See DesignData.coverTitle. */
	coverTitle: boolean
	partnerLogos: PartnerLogoState[]
}

export function newDesign(templateId = DEFAULT_TEMPLATE_ID, chapterId = ''): DesignState {
	return {
		chapterId,
		templateId,
		themeId: DEFAULT_THEME_ID,
		valuesByTemplate: {},
		qrCodesByTemplate: {},
		trackQr: false,
		qrSize: 'm',
		photo: null,
		photoClear: false,
		coverTitle: true,
		partnerLogos: []
	}
}

/** The design's layout. Older saves may still name a hidden layout (Caption), so fall back to the default. */
export function designTemplate(design: DesignState): Template {
	return (
		DESIGN_TEMPLATES.find((t) => t.id === design.templateId) ?? getTemplate(DEFAULT_TEMPLATE_ID)
	)
}

/** A layout's default text for the design's chapter. */
export function designDefaults(design: DesignState, template = designTemplate(design)): Values {
	return defaultValues(template, chapterFieldDefaults(getChapter(design.chapterId), template.id))
}

/** The current layout's text, merged over its defaults so fields added after a volunteer's last visit still get a value. */
export function designValues(design: DesignState): Values {
	const template = designTemplate(design)
	return { ...designDefaults(design, template), ...design.valuesByTemplate[template.id] }
}

/**
 * The design for another chapter. Text still at the old chapter's default (the button, the web address) changes to
 * the new chapter's; anything the volunteer typed stays.
 */
export function withChapter(design: DesignState, chapterId: string): DesignState {
	const next = { ...design, chapterId }
	const valuesByTemplate: Record<string, Values> = {}
	for (const [templateId, values] of Object.entries(design.valuesByTemplate)) {
		const template = getTemplate(templateId)
		const before = designDefaults(design, template)
		const after = designDefaults(next, template)
		valuesByTemplate[templateId] = Object.fromEntries(
			Object.entries(values).map(([key, value]) => [
				key,
				value === before[key] ? (after[key] ?? value) : value
			])
		)
	}
	return { ...next, valuesByTemplate }
}

/** The design's country as its header shows it: "UK", "Deutschland", or empty for PauseAI as a whole. */
export function designCountry(design: DesignState): string {
	return getChapter(design.chapterId).shortName
}

/** The current layout's QR codes. */
export function designQrCodes(design: DesignState): QrCode[] {
	return design.qrCodesByTemplate[designTemplate(design).id] ?? []
}

/** The design with the current layout's QR codes replaced. */
export function withQrCodes(design: DesignState, qrCodes: QrCode[]): DesignState {
	return {
		...design,
		qrCodesByTemplate: { ...design.qrCodesByTemplate, [designTemplate(design).id]: qrCodes }
	}
}

/**
 * Plain data for saving. Uploaded photos are embedded only when `embedUploads` is set: project files carry them,
 * browser autosave does not (too big). Partner logos are small once downscaled, so both keep them.
 */
export function designToData(design: DesignState, embedUploads: boolean): DesignData {
	let photo: ProjectPhoto | null = null
	if (design.photo?.source.kind === 'library')
		photo = { kind: 'library', id: design.photo.source.id }
	else if (design.photo && embedUploads)
		photo = {
			kind: 'upload',
			name: design.photo.name,
			dataUrl: drawableToJpegDataUrl(design.photo.drawable)
		}
	return {
		chapterId: design.chapterId,
		templateId: design.templateId,
		themeId: design.themeId,
		values: design.valuesByTemplate,
		qrCodes: design.qrCodesByTemplate,
		trackQr: design.trackQr,
		qrSize: design.qrSize,
		photo,
		photoClear: design.photoClear,
		coverTitle: design.coverTitle,
		partnerLogos: design.partnerLogos.map(({ name, dataUrl }) => ({ name, dataUrl }))
	}
}

/** Loads a saved design's images. `ok` is false when the photo or a partner logo could not be loaded. */
export async function designFromData(
	data: DesignData
): Promise<{ design: DesignState; ok: boolean }> {
	let ok = true
	let photo: PhotoState | null = null
	if (data.photo) {
		try {
			if (data.photo.kind === 'library') {
				const id = data.photo.id
				// parseProject only accepts ids in the library.
				const item = LIBRARY_PHOTOS.find((p) => p.id === id)!
				photo = {
					drawable: await loadImage(item.src),
					name: item.label,
					source: { kind: 'library', id }
				}
			} else {
				photo = {
					drawable: await loadDataUrl(data.photo.dataUrl),
					name: data.photo.name,
					source: { kind: 'upload' }
				}
			}
		} catch {
			ok = false
		}
	}
	const partnerLogos: PartnerLogoState[] = []
	for (const logo of data.partnerLogos) {
		try {
			partnerLogos.push({ ...logo, drawable: await loadDataUrl(logo.dataUrl) })
		} catch {
			ok = false
		}
	}
	return {
		ok,
		design: {
			chapterId: data.chapterId,
			templateId: data.templateId,
			themeId: data.themeId,
			valuesByTemplate: data.values,
			qrCodesByTemplate: data.qrCodes,
			trackQr: data.trackQr,
			qrSize: data.qrSize,
			photo,
			photoClear: data.photoClear,
			coverTitle: data.coverTitle,
			partnerLogos
		}
	}
}
