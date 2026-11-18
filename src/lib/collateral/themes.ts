import { contrastOf, hexToRgb, luminance } from './contrast'

export type ThemeId = 'orange' | 'cream' | 'black'

export interface Theme {
	id: ThemeId
	label: string
	bg: string
	text: string
	/** Secondary text, e.g. blurbs and footers. */
	muted: string
	/** Fill colour for the CTA pill and rules. */
	accent: string
	/** Text colour to use on top of `accent`. */
	onAccent: string
	/** Accent colour that is safe to use as text on `bg`. */
	accentText: string
	/** Path of the logo variant that reads well on `bg`. */
	logoSrc: string
	/**
	 * Darker small-text colours for when a photo sits behind the text. A tinted photo is darker and busier than the
	 * plain style colour, so colours that pass on `bg` alone can fail over it (measured by the contrast check).
	 */
	onPhoto?: { muted?: string; accentText?: string }
}

// The orange in the logo ($lib/components/logo.svelte, via HERO_ORANGE in $lib/colors). Every orange in the collateral tools comes from here,
// except the darker shade below that is used for small text.
export const BRAND_ORANGE = '#FF9416'
/** The same hue as the logo orange, darkened until it reads as text on cream (WCAG AA). */
const ORANGE_TEXT = '#A65A00'
export const INK = '#1A1612'
const CREAM = '#FDF8F3'

const LOGO_DIR = '/images/logos/collateral'

export const THEMES: Theme[] = [
	{
		id: 'orange',
		label: 'Orange',
		bg: BRAND_ORANGE,
		text: INK,
		muted: '#3A2A18',
		accent: INK,
		onAccent: CREAM,
		accentText: INK,
		logoSrc: `${LOGO_DIR}/logo-white-black-white.svg`,
		onPhoto: { muted: '#221810' }
	},
	{
		id: 'cream',
		label: 'Cream',
		bg: CREAM,
		text: INK,
		muted: '#5C544A',
		accent: BRAND_ORANGE,
		onAccent: INK,
		accentText: ORANGE_TEXT,
		logoSrc: `${LOGO_DIR}/logo-color-on-light.svg`,
		// The dark orange only reads on plain cream, so small text turns to ink over a photo.
		onPhoto: { muted: '#2E2922', accentText: INK }
	},
	{
		id: 'black',
		label: 'Black',
		bg: INK,
		text: CREAM,
		muted: '#D4C4B0',
		accent: BRAND_ORANGE,
		onAccent: INK,
		accentText: BRAND_ORANGE,
		logoSrc: `${LOGO_DIR}/logo-color-on-dark.svg`
	}
]

const DEFAULT_THEME_ID: ThemeId = 'orange'

/** Styles that were retired, and the style that now looks the same. Clear was Cream with no colour over the photo. */
const RETIRED_THEMES: Record<string, ThemeId> = { clear: 'cream' }

export function getTheme(id: string): Theme {
	const current = RETIRED_THEMES[id] ?? id
	return THEMES.find((t) => t.id === current) ?? THEMES.find((t) => t.id === DEFAULT_THEME_ID)!
}

/** WCAG contrast ratio between two "#rrggbb" colours. */
export function contrastRatio(a: string, b: string): number {
	return contrastOf(luminance(hexToRgb(a) ?? [0, 0, 0]), luminance(hexToRgb(b) ?? [0, 0, 0]))
}
