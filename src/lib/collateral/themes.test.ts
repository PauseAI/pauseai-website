import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'
import { HERO_ORANGE } from '$lib/colors'
import { BRAND_ORANGE, contrastRatio, getTheme, THEMES } from './themes'

describe('contrastRatio', () => {
	it('is 21 for black on white and 1 for identical colours', () => {
		expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0)
		expect(contrastRatio('#FF9416', '#FF9416')).toBeCloseTo(1, 5)
	})
})

describe.each(THEMES)('theme $id', (theme) => {
	it('has AA contrast for body text on the background', () => {
		expect(contrastRatio(theme.text, theme.bg)).toBeGreaterThanOrEqual(7)
		expect(contrastRatio(theme.muted, theme.bg)).toBeGreaterThanOrEqual(4.5)
	})

	it('has AA contrast for accent text on the background', () => {
		expect(contrastRatio(theme.accentText, theme.bg)).toBeGreaterThanOrEqual(4.5)
	})

	it('has AA contrast for text inside the accent pill', () => {
		expect(contrastRatio(theme.onAccent, theme.accent)).toBeGreaterThanOrEqual(4.5)
	})
})

describe('getTheme', () => {
	it('falls back to orange', () => {
		expect(getTheme('nope').id).toBe('orange')
	})
})

describe('theme logos', () => {
	it.each(THEMES)('$id logo file exists in static/', (theme) => {
		expect(existsSync(join(process.cwd(), 'static', theme.logoSrc))).toBe(true)
	})
})

describe('brand orange', () => {
	const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8').toUpperCase()

	// The collateral tools take their orange from the logo, so they must not drift apart.
	it('is the orange used in the site logo', () => {
		expect(HERO_ORANGE.toUpperCase()).toBe(BRAND_ORANGE.toUpperCase())
		expect(read('static/images/logos/collateral/logo-color-on-light.svg')).toContain(
			`FILL="${BRAND_ORANGE.toUpperCase()}"`
		)
	})

	it('is the button colour on every style that has an orange button', () => {
		for (const theme of THEMES.filter((t) => t.id !== 'orange')) {
			expect(theme.accent.toUpperCase()).toBe(BRAND_ORANGE.toUpperCase())
		}
	})
})

describe('on-photo text colours', () => {
	// A photo under Strong colour can be anywhere from the style colour blended with black to blended with white.
	// Small text over it should still reach AA against the style colour blended three parts to one with black.
	const blendWithBlack = (hex: string, visible: number) =>
		`#${[1, 3, 5]
			.map((i) =>
				Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - visible))
					.toString(16)
					.padStart(2, '0')
			)
			.join('')}`

	it.each(THEMES.filter((t) => t.onPhoto))(
		'$id small text reads over a dark photo at Strong colour',
		(theme) => {
			const behind = blendWithBlack(theme.bg, 0.25)
			const muted = theme.onPhoto?.muted ?? theme.muted
			const accent = theme.onPhoto?.accentText ?? theme.accentText
			expect(contrastRatio(muted, behind)).toBeGreaterThanOrEqual(4.5)
			expect(contrastRatio(accent, behind)).toBeGreaterThanOrEqual(4.5)
		}
	)
})
