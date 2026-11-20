/**
 * The faces business cards draw with: the brand fonts' bold for headings and the first name, as on the other designs,
 * and their light weights for the last name, title and email, as in the Figma design.
 */
import type { CardFont } from './businessCards'
import { BODY_FAMILY, HEADLINE_FAMILY } from './canvasFonts'
import { BODY_FONT, DISPLAY_FONT } from './templates'

export const CARD_FONT_FACES: { family: string; weight: string }[] = [
	{ family: HEADLINE_FAMILY, weight: '700' },
	{ family: HEADLINE_FAMILY, weight: '300' },
	{ family: BODY_FAMILY, weight: '300' }
]

const CSS: Record<CardFont, { weight: number; stack: string }> = {
	display: { weight: 700, stack: DISPLAY_FONT },
	displayLight: { weight: 300, stack: DISPLAY_FONT },
	bodyLight: { weight: 300, stack: BODY_FONT }
}

/** The canvas `font` string for `font` at `size` px. */
export function cardFontCss(font: CardFont, size: number): string {
	const { weight, stack } = CSS[font]
	return `${weight} ${size}px ${stack}`
}
