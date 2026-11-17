/**
 * The faces the tools draw into canvases (and inline into SVGs) with: the site's own brand fonts, Saira Condensed for
 * headlines and Roboto Slab for body text, under family names of their own so they never clash with the site's
 * stylesheet faces. Each weight comes in several subsets, split by unicode range like the site's own @font-face rules,
 * so a design in Polish, Czech or Romanian gets its accents and one in Serbian or Greek gets Cyrillic or Greek letters,
 * while an English one only loads the Latin file.
 *
 * Browser only: added to the page by declareCanvasFonts when a tool first needs them.
 */
import sairaLatin700 from '@fontsource/saira-condensed/files/saira-condensed-latin-700-normal.woff2'
import sairaLatinExt700 from '@fontsource/saira-condensed/files/saira-condensed-latin-ext-700-normal.woff2'
import robotoSlabLatin500 from '@fontsource/roboto-slab/files/roboto-slab-latin-500-normal.woff2'
import robotoSlabLatinExt500 from '@fontsource/roboto-slab/files/roboto-slab-latin-ext-500-normal.woff2'
import robotoSlabCyrillic500 from '@fontsource/roboto-slab/files/roboto-slab-cyrillic-500-normal.woff2'
import robotoSlabGreek500 from '@fontsource/roboto-slab/files/roboto-slab-greek-500-normal.woff2'
import robotoSlabLatin600 from '@fontsource/roboto-slab/files/roboto-slab-latin-600-normal.woff2'
import robotoSlabLatinExt600 from '@fontsource/roboto-slab/files/roboto-slab-latin-ext-600-normal.woff2'
import robotoSlabCyrillic600 from '@fontsource/roboto-slab/files/roboto-slab-cyrillic-600-normal.woff2'
import robotoSlabGreek600 from '@fontsource/roboto-slab/files/roboto-slab-greek-600-normal.woff2'
import robotoSlabLatin700 from '@fontsource/roboto-slab/files/roboto-slab-latin-700-normal.woff2'
import robotoSlabLatinExt700 from '@fontsource/roboto-slab/files/roboto-slab-latin-ext-700-normal.woff2'
import robotoSlabCyrillic700 from '@fontsource/roboto-slab/files/roboto-slab-cyrillic-700-normal.woff2'
import robotoSlabGreek700 from '@fontsource/roboto-slab/files/roboto-slab-greek-700-normal.woff2'
import robotoSlabLatin800 from '@fontsource/roboto-slab/files/roboto-slab-latin-800-normal.woff2'
import robotoSlabLatinExt800 from '@fontsource/roboto-slab/files/roboto-slab-latin-ext-800-normal.woff2'
import robotoSlabCyrillic800 from '@fontsource/roboto-slab/files/roboto-slab-cyrillic-800-normal.woff2'
import robotoSlabGreek800 from '@fontsource/roboto-slab/files/roboto-slab-greek-800-normal.woff2'

/** Unicode ranges of the @fontsource subsets, copied from their CSS. */
export const UNICODE_RANGES = {
	latin:
		'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
	'latin-ext':
		'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF',
	cyrillic: 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116',
	greek: 'U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF'
} as const

export type Subset = keyof typeof UNICODE_RANGES

export interface CanvasFace {
	family: string
	weight: string
	subset: Subset
	file: string
}

export const HEADLINE_FAMILY = 'PAI Saira Condensed'
export const BODY_FAMILY = 'PAI Roboto Slab'

export const CANVAS_FONTS: CanvasFace[] = [
	{ family: HEADLINE_FAMILY, weight: '700', subset: 'latin', file: sairaLatin700 },
	{ family: HEADLINE_FAMILY, weight: '700', subset: 'latin-ext', file: sairaLatinExt700 },
	{ family: BODY_FAMILY, weight: '500', subset: 'latin', file: robotoSlabLatin500 },
	{ family: BODY_FAMILY, weight: '500', subset: 'latin-ext', file: robotoSlabLatinExt500 },
	{ family: BODY_FAMILY, weight: '500', subset: 'cyrillic', file: robotoSlabCyrillic500 },
	{ family: BODY_FAMILY, weight: '500', subset: 'greek', file: robotoSlabGreek500 },
	{ family: BODY_FAMILY, weight: '600', subset: 'latin', file: robotoSlabLatin600 },
	{ family: BODY_FAMILY, weight: '600', subset: 'latin-ext', file: robotoSlabLatinExt600 },
	{ family: BODY_FAMILY, weight: '600', subset: 'cyrillic', file: robotoSlabCyrillic600 },
	{ family: BODY_FAMILY, weight: '600', subset: 'greek', file: robotoSlabGreek600 },
	{ family: BODY_FAMILY, weight: '700', subset: 'latin', file: robotoSlabLatin700 },
	{ family: BODY_FAMILY, weight: '700', subset: 'latin-ext', file: robotoSlabLatinExt700 },
	{ family: BODY_FAMILY, weight: '700', subset: 'cyrillic', file: robotoSlabCyrillic700 },
	{ family: BODY_FAMILY, weight: '700', subset: 'greek', file: robotoSlabGreek700 },
	{ family: BODY_FAMILY, weight: '800', subset: 'latin', file: robotoSlabLatin800 },
	{ family: BODY_FAMILY, weight: '800', subset: 'latin-ext', file: robotoSlabLatinExt800 },
	{ family: BODY_FAMILY, weight: '800', subset: 'cyrillic', file: robotoSlabCyrillic800 },
	{ family: BODY_FAMILY, weight: '800', subset: 'greek', file: robotoSlabGreek800 }
]

/** Parses a CSS unicode-range list into inclusive code point ranges. */
export function parseUnicodeRange(range: string): [number, number][] {
	return range.split(',').map((part) => {
		const [lo, hi] = part.trim().replace(/^U\+/i, '').split('-')
		const start = parseInt(lo, 16)
		return [start, hi ? parseInt(hi, 16) : start]
	})
}

const PARSED = Object.fromEntries(
	Object.entries(UNICODE_RANGES).map(([subset, range]) => [subset, parseUnicodeRange(range)])
) as Record<Subset, [number, number][]>

/** Whether any character of `text` falls in `subset`. Latin always counts, as spaces and digits live there. */
export function subsetCovers(subset: Subset, text: string): boolean {
	if (subset === 'latin') return true
	for (const ch of text) {
		const cp = ch.codePointAt(0)!
		if (PARSED[subset].some(([lo, hi]) => cp >= lo && cp <= hi)) return true
	}
	return false
}

/** The subsets `text` needs, Latin first. */
export function subsetsFor(text: string): Subset[] {
	return (Object.keys(UNICODE_RANGES) as Subset[]).filter((subset) => subsetCovers(subset, text))
}

/** The faces of `family` at `weight` that `text` needs. */
export function facesFor(family: string, weight: string, text: string): CanvasFace[] {
	return CANVAS_FONTS.filter(
		(f) => f.family === family && f.weight === weight && subsetCovers(f.subset, text)
	)
}

let declared = false

/**
 * Adds the canvas faces to the page, once, so `document.fonts.load` can load them. Until a face loads, text drawn in
 * it is held back (display "block"), not drawn in a fallback.
 */
export function declareCanvasFonts(): void {
	if (declared) return
	declared = true
	for (const { family, weight, file, subset } of CANVAS_FONTS) {
		document.fonts.add(
			new FontFace(family, `url("${file}") format("woff2")`, {
				weight,
				display: 'block',
				unicodeRange: UNICODE_RANGES[subset]
			})
		)
	}
}
