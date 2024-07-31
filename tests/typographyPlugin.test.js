import { describe, it, expect, vi } from 'vitest'
import {
	applySemicolonRule,
	applyQuestionMarkRule,
	applyExclamationMarkRule,
	applyPercentSymbolRule,
	applyCurrencySymbolRule,
	applyColonRule,
	applyFrenchQuotesRule,
	applyQuoteReplacementRule,
	applyNumberUnitRule,
	applyTypographyRules
} from '$lib/typographyPlugin'

const THIN_SPACE = '\u202F'
const REGULAR_SPACE = '\u00A0'

describe('applySemicolonRule', () => {
	it('should add a thin non-breaking space before semicolon', () => {
		expect(applySemicolonRule('Hello; world')).toBe(`Hello${THIN_SPACE}; world`)
	})

	it('should replace existing space with thin non-breaking space before semicolon', () => {
		expect(applySemicolonRule('Hello ; world')).toBe(`Hello${THIN_SPACE}; world`)
	})

	it('should handle multiple semicolons', () => {
		expect(applySemicolonRule('One;Two;Three')).toBe(`One${THIN_SPACE};Two${THIN_SPACE};Three`)
	})

	it('should add a thin non-breaking space before semicolon at the start of a phrase', () => {
		expect(applySemicolonRule('; world')).toBe(`${THIN_SPACE}; world`)
	})

	it('should replace existing space with thin non-breaking space before semicolon at the start of a phrase', () => {
		expect(applySemicolonRule(' ; world')).toBe(`${THIN_SPACE}; world`)
	})

	it('should add a thin non-breaking space before semicolon at the end of a phrase', () => {
		expect(applySemicolonRule('Hello;')).toBe(`Hello${THIN_SPACE};`)
	})

	it('should replace existing space with thin non-breaking space before semicolon at the end of a phrase', () => {
		expect(applySemicolonRule('Hello ;')).toBe(`Hello${THIN_SPACE};`)
	})
})

describe('applyQuestionMarkRule', () => {
	it('should add a thin non-breaking space before question mark', () => {
		expect(applyQuestionMarkRule('Hello? world')).toBe(`Hello${THIN_SPACE}? world`)
	})

	it('should replace existing space with thin non-breaking space before question mark', () => {
		expect(applyQuestionMarkRule('Hello ? world')).toBe(`Hello${THIN_SPACE}? world`)
	})

	it('should handle multiple question marks', () => {
		expect(applyQuestionMarkRule('What?Who?Where?')).toBe(
			`What${THIN_SPACE}?Who${THIN_SPACE}?Where${THIN_SPACE}?`
		)
	})

	it('should add a thin non-breaking space before question mark at the start of a phrase', () => {
		expect(applyQuestionMarkRule('? world')).toBe(`${THIN_SPACE}? world`)
	})

	it('should replace existing space with thin non-breaking space before question mark at the start of a phrase', () => {
		expect(applyQuestionMarkRule(' ? world')).toBe(`${THIN_SPACE}? world`)
	})

	it('should add a thin non-breaking space before question mark at the end of a phrase', () => {
		expect(applyQuestionMarkRule('Hello?')).toBe(`Hello${THIN_SPACE}?`)
	})

	it('should replace existing space with thin non-breaking space before question mark at the end of a phrase', () => {
		expect(applyQuestionMarkRule('Hello ?')).toBe(`Hello${THIN_SPACE}?`)
	})
})

describe('applyExclamationMarkRule', () => {
	it('should add a thin non-breaking space before exclamation mark', () => {
		expect(applyExclamationMarkRule('Hello! world')).toBe(`Hello${THIN_SPACE}! world`)
	})

	it('should replace existing space with thin non-breaking space before exclamation mark', () => {
		expect(applyExclamationMarkRule('Hello ! world')).toBe(`Hello${THIN_SPACE}! world`)
	})

	it('should handle multiple exclamation marks', () => {
		expect(applyExclamationMarkRule('Wow!Amazing!Incredible!')).toBe(
			`Wow${THIN_SPACE}!Amazing${THIN_SPACE}!Incredible${THIN_SPACE}!`
		)
	})

	it('should add a thin non-breaking space before exclamation mark at the start of a phrase', () => {
		expect(applyExclamationMarkRule('! world')).toBe(`${THIN_SPACE}! world`)
	})

	it('should replace existing space with thin non-breaking space before exclamation mark at the start of a phrase', () => {
		expect(applyExclamationMarkRule(' ! world')).toBe(`${THIN_SPACE}! world`)
	})

	it('should add a thin non-breaking space before exclamation mark at the end of a phrase', () => {
		expect(applyExclamationMarkRule('Hello!')).toBe(`Hello${THIN_SPACE}!`)
	})

	it('should replace existing space with thin non-breaking space before exclamation mark at the end of a phrase', () => {
		expect(applyExclamationMarkRule('Hello !')).toBe(`Hello${THIN_SPACE}!`)
	})
})

describe('applyPercentSymbolRule', () => {
	it('should add a thin non-breaking space before percent symbol', () => {
		expect(applyPercentSymbolRule('50%')).toBe(`50${THIN_SPACE}%`)
	})

	it('should replace existing space with thin non-breaking space before percent symbol', () => {
		expect(applyPercentSymbolRule('50 %')).toBe(`50${THIN_SPACE}%`)
	})

	it('should handle decimal numbers', () => {
		expect(applyPercentSymbolRule('3.14%')).toBe(`3.14${THIN_SPACE}%`)
		expect(applyPercentSymbolRule('3,14%')).toBe(`3,14${THIN_SPACE}%`)
	})

	it('should handle multiple percentages', () => {
		expect(applyPercentSymbolRule('10% 20% 30%')).toBe(
			`10${THIN_SPACE}% 20${THIN_SPACE}% 30${THIN_SPACE}%`
		)
	})
})

describe('applyCurrencySymbolRule', () => {
	it('should add a thin non-breaking space after currency symbol before number', () => {
		expect(applyCurrencySymbolRule('$50')).toBe(`$${THIN_SPACE}50`)
		expect(applyCurrencySymbolRule('€100')).toBe(`€${THIN_SPACE}100`)
	})

	it('should add a thin non-breaking space before currency symbol after number', () => {
		expect(applyCurrencySymbolRule('50$')).toBe(`50${THIN_SPACE}$`)
		expect(applyCurrencySymbolRule('100€')).toBe(`100${THIN_SPACE}€`)
	})

	it('should replace existing space with thin non-breaking space', () => {
		expect(applyCurrencySymbolRule('$ 50')).toBe(`$${THIN_SPACE}50`)
		expect(applyCurrencySymbolRule('50 €')).toBe(`50${THIN_SPACE}€`)
	})

	it('should handle multiple currency symbols', () => {
		expect(applyCurrencySymbolRule('$10 £20 30€')).toBe(
			`$${THIN_SPACE}10 £${THIN_SPACE}20 30${THIN_SPACE}€`
		)
	})
})

describe('applyColonRule', () => {
	it('should add a regular non-breaking space before colon', () => {
		expect(applyColonRule('Hello: world')).toBe(`Hello${REGULAR_SPACE}: world`)
	})

	it('should replace existing space with regular non-breaking space before colon', () => {
		expect(applyColonRule('Hello : world')).toBe(`Hello${REGULAR_SPACE}: world`)
	})

	it('should not modify time format', () => {
		expect(applyColonRule('The time is 12:30')).toBe('The time is 12:30')
	})

	it('should handle multiple colons', () => {
		expect(applyColonRule('One:Two:Three')).toBe(`One${REGULAR_SPACE}:Two${REGULAR_SPACE}:Three`)
	})

	it('should add a regular non-breaking space before colon at the start of a phrase', () => {
		expect(applyColonRule(': world')).toBe(`${REGULAR_SPACE}: world`)
	})

	it('should replace existing space with regular non-breaking space before colon at the start of a phrase', () => {
		expect(applyColonRule(' : world')).toBe(`${REGULAR_SPACE}: world`)
	})

	it('should add a regular non-breaking space before colon at the end of a phrase', () => {
		expect(applyColonRule('Hello:')).toBe(`Hello${REGULAR_SPACE}:`)
	})

	it('should replace existing space with regular non-breaking space before colon at the end of a phrase', () => {
		expect(applyColonRule('Hello :')).toBe(`Hello${REGULAR_SPACE}:`)
	})
})

describe('applyFrenchQuotesRule', () => {
	it('should add a regular non-breaking space after opening French quote', () => {
		expect(applyFrenchQuotesRule('«Hello')).toBe(`«${REGULAR_SPACE}Hello`)
	})

	it('should add a regular non-breaking space before closing French quote', () => {
		expect(applyFrenchQuotesRule('Hello»')).toBe(`Hello${REGULAR_SPACE}»`)
	})

	it('should add a regular non-breaking space before and after French quotes', () => {
		expect(applyFrenchQuotesRule('«Hello»')).toBe(`«${REGULAR_SPACE}Hello${REGULAR_SPACE}»`)
	})

	it('should replace existing space with regular non-breaking space for French quotes', () => {
		expect(applyFrenchQuotesRule('« Hello »')).toBe(`«${REGULAR_SPACE}Hello${REGULAR_SPACE}»`)
	})

	it('should handle multiple French quotes', () => {
		expect(applyFrenchQuotesRule('«One» «Two» «Three»')).toBe(
			`«${REGULAR_SPACE}One${REGULAR_SPACE}» «${REGULAR_SPACE}Two${REGULAR_SPACE}» «${REGULAR_SPACE}Three${REGULAR_SPACE}»`
		)
	})
})

describe('replaceEnglishQuotes', () => {
	it('should replace English quotes with French quotes', () => {
		expect(applyQuoteReplacementRule('"Hello"')).toBe(`«${REGULAR_SPACE}Hello${REGULAR_SPACE}»`)
	})

	it('should handle multiple quotes', () => {
		expect(applyQuoteReplacementRule('"One" "Two" "Three"')).toBe(
			`«${REGULAR_SPACE}One${REGULAR_SPACE}» «${REGULAR_SPACE}Two${REGULAR_SPACE}» «${REGULAR_SPACE}Three${REGULAR_SPACE}»`
		)
	})

	it('should handle nested quotes', () => {
		expect(applyQuoteReplacementRule('"Outer "Inner" Outer"')).toBe(
			`«${REGULAR_SPACE}Outer «${REGULAR_SPACE}Inner${REGULAR_SPACE}» Outer${REGULAR_SPACE}»`
		)
	})

	it('should log error for unmatched quotes', () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn())
		applyQuoteReplacementRule('"Unmatched')
		expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unmatched quote found'))
		consoleSpy.mockRestore()
	})

	it('should handle quotes at the beginning and end of a string', () => {
		expect(applyQuoteReplacementRule('"Start" middle "End"')).toBe(
			`«${REGULAR_SPACE}Start${REGULAR_SPACE}» middle «${REGULAR_SPACE}End${REGULAR_SPACE}»`
		)
	})

	it('should handle multiple nested quotes', () => {
		expect(applyQuoteReplacementRule('"Outer "Inner1" "Inner2" Outer"')).toBe(
			`«${REGULAR_SPACE}Outer «${REGULAR_SPACE}Inner1${REGULAR_SPACE}» «${REGULAR_SPACE}Inner2${REGULAR_SPACE}» Outer${REGULAR_SPACE}»`
		)
	})
})
describe('applyNumberUnitRule', () => {
	it('should replace normal space with thin non-breaking space before m', () => {
		expect(applyNumberUnitRule('20 m')).toBe(`20${THIN_SPACE}m`)
	})

	it('should handle kilo prefix', () => {
		expect(applyNumberUnitRule('10km')).toBe(`10${THIN_SPACE}km`)
	})

	it('should not modify temperature in degrees', () => {
		expect(applyNumberUnitRule('40°')).toBe('40°')
	})

	it('should add thin non-breaking space before K for Kelvin', () => {
		expect(applyNumberUnitRule('100K')).toBe(`100${THIN_SPACE}K`)
	})

	it('should handle decimal numbers', () => {
		expect(applyNumberUnitRule('10,5km')).toBe(`10,5${THIN_SPACE}km`)
	})

	it('should handle decimal numbers with existing space', () => {
		expect(applyNumberUnitRule('3,14 rad')).toBe(`3,14${THIN_SPACE}rad`)
	})

	it('should format units in text', () => {
		expect(applyNumberUnitRule('La voiture roule à 100km/h sur 50km.')).toBe(
			`La voiture roule à 100${THIN_SPACE}km/h sur 50${THIN_SPACE}km.`
		)
	})

	it('should handle multiple units', () => {
		expect(applyNumberUnitRule('10m20cm')).toBe(`10${THIN_SPACE}m20${THIN_SPACE}cm`)
	})

	it('should not add space in "GPT-4o"', () => {
		expect(applyNumberUnitRule('GPT-4o')).toBe('GPT-4o')
	})

	it('should not replace space in "GPT-4 va"', () => {
		expect(applyNumberUnitRule('GPT-4 va')).toBe('GPT-4 va')
	})

	it('should not replace space in dates', () => {
		expect(applyNumberUnitRule('14 juillet')).toBe('14 juillet')
	})

	it('should handle compound units', () => {
		expect(applyNumberUnitRule('100km/h')).toBe(`100${THIN_SPACE}km/h`)
		expect(applyNumberUnitRule('9.8m/s²')).toBe(`9.8${THIN_SPACE}m/s²`)
	})

	it('should handle scientific notation', () => {
		expect(applyNumberUnitRule('1.5e6J')).toBe(`1.5e6${THIN_SPACE}J`)
	})

	it('should not modify ordinal numbers', () => {
		expect(applyNumberUnitRule('1er mai')).toBe('1er mai')
		expect(applyNumberUnitRule('4e étage')).toBe('4e étage')
		expect(applyNumberUnitRule('2e guerre mondiale')).toBe('2e guerre mondiale')
	})
})
describe('integration', () => {
	it('should correctly apply multiple rules in sequence', () => {
		expect(
			applyTypographyRules('Le prix est de 4000$ pour 50kg à 20%, soit "une bonne affaire"!')
		).toBe(
			`Le prix est de 4000${THIN_SPACE}$ pour 50${THIN_SPACE}kg à 20${THIN_SPACE}%, soit «${REGULAR_SPACE}une bonne affaire${REGULAR_SPACE}»${THIN_SPACE}!`
		)
	})

	it('should handle mixed English and French quotes', () => {
		expect(applyTypographyRules('"English" et «French»')).toBe(
			`«${REGULAR_SPACE}English${REGULAR_SPACE}» et «${REGULAR_SPACE}French${REGULAR_SPACE}»`
		)
	})
})
