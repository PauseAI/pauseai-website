/**
 * How strongly the style's colour covers a photo, lightest first. Designs pick the lightest step their text reads
 * on (see renderCollateral), so nobody has to choose. There is deliberately no untinted step: text straight on a
 * photo needed an outline to read, which did not look good.
 */
export type PhotoTint = 'medium' | 'strong'

export const PHOTO_TINTS: { id: PhotoTint; visible: number }[] = [
	{ id: 'medium', visible: 0.5 },
	{ id: 'strong', visible: 0.25 }
]

/** Preferred QR size. Codes never go below the size phones can scan, and each layout caps how big they get. */
export type QrSize = 'm' | 'l'

export const QR_SIZES: { id: QrSize; label: string }[] = [
	{ id: 'm', label: 'Medium' },
	{ id: 'l', label: 'Large' }
]

export function isQrSize(v: unknown): v is QrSize {
	return QR_SIZES.some((s) => s.id === v)
}

/** The title size nudge: a multiplier on the automatic size range. 1 is automatic. */
export const HEADLINE_SCALE_MIN = 0.7
export const HEADLINE_SCALE_MAX = 1.3
export const HEADLINE_SCALE_STEP = 0.1

export function clampHeadlineScale(v: unknown): number {
	if (typeof v !== 'number' || !Number.isFinite(v)) return 1
	// Round to the step so repeated nudges land on tidy values.
	const stepped = Math.round(v / HEADLINE_SCALE_STEP) * HEADLINE_SCALE_STEP
	return Math.min(HEADLINE_SCALE_MAX, Math.max(HEADLINE_SCALE_MIN, Number(stepped.toFixed(2))))
}

/** Partner logos sit to the right of the PauseAI logo. More than two crowds the header. */
export const MAX_PARTNER_LOGOS = 2
