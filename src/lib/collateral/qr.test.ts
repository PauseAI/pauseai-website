import { describe, expect, it } from 'vitest'
import {
	isEmailLink,
	isQrLink,
	isWebAddress,
	MAX_QR_CODES,
	normaliseUrl,
	QR_MAX_SHARE_MULTI,
	QR_MAX_SHARE_SINGLE,
	QR_MIN_MODULE_PX,
	QR_MIN_PRINT_MM,
	QR_PANEL_PAD,
	qrFilenameStem,
	qrMatrix,
	qrMinPrintMm,
	qrMinScreenPx,
	qrPlan,
	qrTarget,
	qrTooLong,
	usableQrCodes
} from './qr'

describe('normaliseUrl', () => {
	it('adds https to bare addresses', () => {
		expect(normaliseUrl('pauseai.uk/london')).toBe('https://pauseai.uk/london')
	})

	it('keeps existing schemes and trims', () => {
		expect(normaliseUrl('  http://example.com ')).toBe('http://example.com')
	})

	it('returns empty for empty input', () => {
		expect(normaliseUrl('   ')).toBe('')
	})

	it('adds mailto to a bare email address, and keeps one already there', () => {
		expect(normaliseUrl(' hello@pauseai.uk ')).toBe('mailto:hello@pauseai.uk')
		expect(normaliseUrl('MAILTO:hello@pauseai.uk?subject=Hi')).toBe(
			'MAILTO:hello@pauseai.uk?subject=Hi'
		)
	})
})

describe('isEmailLink', () => {
	it.each([
		'hello@pauseai.uk',
		'mailto:jane.smith@example.co.uk',
		'mailto:hello@pauseai.uk?subject=Flyers&body=Hi'
	])('accepts %j', (input) => {
		expect(isEmailLink(input)).toBe(true)
	})

	it.each([
		'',
		'mailto:',
		'mailto:hello',
		'mailto:hello@pauseai',
		'hello@pauseai.uk please',
		'pauseai.uk'
	])('rejects %j', (input) => {
		expect(isEmailLink(input)).toBe(false)
	})
})

describe('isQrLink', () => {
	it('takes a web address or an email link, and nothing else', () => {
		expect(isQrLink('pauseai.uk/join')).toBe(true)
		expect(isQrLink('mailto:hello@pauseai.uk')).toBe(true)
		expect(isQrLink('not a link')).toBe(false)
	})
})

describe('isWebAddress', () => {
	it.each(['pauseai.uk', 'pauseai.uk/join?x=1', 'https://lu.ma/abc123', ' www.example.co.uk '])(
		'accepts %j',
		(input) => {
			expect(isWebAddress(input)).toBe(true)
		}
	)

	it.each([
		'',
		'not a url',
		'pauseai',
		'https://',
		'mailto:hello@pauseai.uk',
		'hello@pauseai.uk',
		'pauseai.uk/some page'
	])('rejects %j', (input) => {
		expect(isWebAddress(input)).toBe(false)
	})
})

describe('qrTarget', () => {
	it('opens the address as typed, with https added', () => {
		expect(qrTarget('pauseai.uk', false)).toBe('https://pauseai.uk')
		expect(qrTarget('pauseai.uk/a?x=1#b', false)).toBe('https://pauseai.uk/a?x=1#b')
	})

	// UTM tagging is switched off for now, so even `track: true` leaves the address alone.
	it('does not add utm params, even when asked', () => {
		expect(qrTarget('pauseai.uk', true)).toBe('https://pauseai.uk')
	})

	// Restore this test together with the UTM block in qrTarget.
	// it("appends utm params, respecting existing queries and hashes", () => {
	//   expect(qrTarget("pauseai.uk", true)).toBe("https://pauseai.uk?utm_source=collateral&utm_medium=qr");
	//   expect(qrTarget("pauseai.uk/a?x=1", true)).toBe("https://pauseai.uk/a?x=1&utm_source=collateral&utm_medium=qr");
	//   expect(qrTarget("pauseai.uk/a#b", true)).toBe("https://pauseai.uk/a?utm_source=collateral&utm_medium=qr#b");
	// });
})

describe('qrMatrix', () => {
	it('returns a square matrix with finder patterns in the corners', () => {
		const m = qrMatrix('https://pauseai.uk')
		expect(m.length).toBeGreaterThanOrEqual(21)
		for (const row of m) expect(row.length).toBe(m.length)
		expect(m[0][0]).toBe(true)
		expect(m[0][m.length - 1]).toBe(true)
		expect(m[m.length - 1][0]).toBe(true)
	})
})

describe('usableQrCodes', () => {
	it('skips rows with no address and caps the count', () => {
		const rows = [
			{ label: 'a', url: '' },
			{ label: 'b', url: ' ' },
			...Array.from({ length: 6 }, (_, n) => ({ label: `c${n}`, url: `x.com/${n}` }))
		]
		const usable = usableQrCodes(rows)
		expect(usable).toHaveLength(MAX_QR_CODES)
		expect(usable[0].label).toBe('c0')
	})
})

describe('qrPlan', () => {
	const base = { urls: ['pauseai.uk'], track: true }
	const px = (plan: { size: number }, width: number, urls = base.urls) => {
		const modules = qrMatrix(qrTarget(urls[0], true)).length
		return (plan.size * (1 - 2 * QR_PANEL_PAD)) / modules
	}

	it('needs a web address', () => {
		expect(qrPlan({ ...base, urls: [], width: 1080, height: 1080 }).ok).toBe(false)
	})

	it('fits comfortably on a square post at or above the pixel minimum', () => {
		const plan = qrPlan({ ...base, width: 1080, height: 1080 })
		expect(plan.ok).toBe(true)
		expect(plan.shown).toBe(1)
		expect(px(plan, 1080)).toBeGreaterThanOrEqual(QR_MIN_MODULE_PX - 0.1)
	})

	it('is hidden on an X header, where it would be too small or crowd the design', () => {
		const plan = qrPlan({ ...base, width: 1500, height: 500 })
		expect(plan.ok).toBe(false)
		expect(plan.reason).toMatch(/too small/i)
	})

	it('still fits on a tall story even though the preferred size is above the cap', () => {
		const plan = qrPlan({ ...base, width: 1080, height: 1920 })
		expect(plan.ok).toBe(true)
		expect(plan.size).toBeLessThanOrEqual(1080 * QR_MAX_SHARE_SINGLE + 1)
	})

	it('is at least 25mm wide on print', () => {
		const plan = qrPlan({ ...base, width: 1748, height: 2480, dpi: 300 })
		expect(plan.ok).toBe(true)
		expect(plan.size).toBeGreaterThanOrEqual((QR_MIN_PRINT_MM / 25.4) * 300)
	})

	it('fits several codes on a flyer at one shared size', () => {
		const plan = qrPlan({
			...base,
			urls: ['pauseai.uk', 'luma.com/pauseai.uk', 'pauseai.uk/donate'],
			width: 1748,
			height: 2480,
			dpi: 300
		})
		expect(plan.ok).toBe(true)
		expect(plan.shown).toBe(3)
		expect(plan.reason).toBeUndefined()
		expect(plan.size).toBeGreaterThanOrEqual((QR_MIN_PRINT_MM / 25.4) * 300)
		expect(plan.size).toBeLessThanOrEqual(2480 * QR_MAX_SHARE_MULTI + 1)
	})

	it('drops codes from the end, with a warning, when they cannot all fit', () => {
		const urls = ['pauseai.uk', 'luma.com/pauseai.uk', 'pauseai.uk/donate', 'pauseai.uk/join']
		const plan = qrPlan({ ...base, urls, width: 720, height: 720 })
		expect(plan.ok).toBe(true)
		expect(plan.shown).toBeLessThan(urls.length)
		expect(plan.reason).toMatch(/only \d of 4/i)
	})

	it('never lets the codes overflow the content width or take too much height', () => {
		const urls = ['pauseai.uk', 'luma.com/pauseai.uk', 'pauseai.uk/donate', 'pauseai.uk/join']
		for (const [w, h, dpi] of [
			[1080, 1080],
			[1080, 1920],
			[1600, 900],
			[1748, 2480, 300],
			[1240, 1748, 300]
		] as const) {
			const plan = qrPlan({ ...base, urls, width: w, height: h, dpi })
			if (!plan.ok) continue
			expect(plan.size).toBeLessThanOrEqual(
				Math.min(w, h) * (plan.shown === 1 ? QR_MAX_SHARE_SINGLE : QR_MAX_SHARE_MULTI) + 1
			)
			expect(plan.size * plan.shown).toBeLessThan(w)
		}
	})
})

describe('qrFilenameStem', () => {
	it('builds a readable, safe name from the address', () => {
		expect(qrFilenameStem('https://www.pauseai.uk/join?x=1')).toBe('pauseai-uk-join')
		expect(qrFilenameStem('luma.com/pauseai.uk')).toBe('luma-com-pauseai-uk')
		expect(qrFilenameStem('mailto:hello@pauseai.uk?subject=Hi')).toBe('hello-pauseai-uk')
	})

	it('never returns an empty or unsafe name', () => {
		expect(qrFilenameStem('')).toBe('code')
		expect(qrFilenameStem('../../etc/passwd')).not.toMatch(/[./\\]/)
		expect(qrFilenameStem('a'.repeat(200)).length).toBeLessThanOrEqual(40)
	})
})

describe('print and screen size guidance', () => {
	it('never goes below 25mm and grows with density', () => {
		expect(qrMinPrintMm(29)).toBe(QR_MIN_PRINT_MM)
		expect(qrMinPrintMm(77)).toBeGreaterThan(QR_MIN_PRINT_MM)
	})

	it('matches the pixel-per-module rule', () => {
		expect(qrMinScreenPx(45)).toBeGreaterThanOrEqual(45 * QR_MIN_MODULE_PX)
	})
})

describe('qrPlan size preference', () => {
	const plan = (sizePref?: 'm' | 'l') =>
		qrPlan({ urls: ['pauseai.uk'], track: false, width: 1080, height: 1350, sizePref })

	it('makes Large larger than the default Medium', () => {
		expect(plan('m').size).toBe(plan().size)
		expect(plan('l').size).toBeGreaterThan(plan().size)
	})

	it('never goes below the scannable minimum', () => {
		expect(plan('m').size).toBeGreaterThanOrEqual(
			qrMinScreenPx(qrMatrix('https://pauseai.uk').length)
		)
	})
})

describe('non-ASCII addresses', () => {
	it('encodes them as UTF-8, as phones read them', async () => {
		const qrcode = (await import('qrcode-generator')).default
		const utf8 = Array.from(new TextEncoder().encode('https://pauseai.de/über'), (b) =>
			String.fromCharCode(b)
		).join('')
		const qr = qrcode(0, 'H')
		qr.addData(utf8)
		qr.make()
		const expected = Array.from({ length: qr.getModuleCount() }, (_, r) =>
			Array.from({ length: qr.getModuleCount() }, (_, c) => qr.isDark(r, c))
		)
		expect(qrMatrix('https://pauseai.de/über')).toEqual(expected)
		// Not the library's own encoding, which drops each character's high byte.
		const naive = qrcode(0, 'H')
		naive.addData('https://pauseai.de/über')
		naive.make()
		expect(qrMatrix('https://pauseai.de/über').length === naive.getModuleCount()).toBe(true)
		expect(
			qrMatrix('https://pauseai.de/über').some((row, r) =>
				row.some((dark, c) => dark !== naive.isDark(r, c))
			)
		).toBe(true)
	})

	it('accepts internationalised top-level domains', () => {
		expect(isWebAddress('пауза.рф')).toBe(true)
	})

	it('counts bytes, not characters, against what a code holds', () => {
		expect(qrTooLong(`https://pauseai.uk/${'a'.repeat(189)}`)).toBe(false)
		expect(qrTooLong(`https://pauseai.info/${'п'.repeat(150)}`)).toBe(true)
	})
})
