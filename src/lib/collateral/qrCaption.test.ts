import { describe, expect, it } from 'vitest'
import { captionLayout, displayLink, type CaptionMeasure } from './qrCaption'
import { qrShape, qrSvg } from './qrShape'

/** Every character is 0.6em wide. */
const measure: CaptionMeasure = (_kind, text, fontSize) => text.length * fontSize * 0.6

describe('displayLink', () => {
	it.each([
		['https://pauseai.uk/join', 'pauseai.uk/join'],
		['pauseai.uk/', 'pauseai.uk'],
		['https://www.example.com/a?b=1', 'example.com/a?b=1'],
		['mailto:hello@pauseai.uk?subject=Hi', 'hello@pauseai.uk'],
		['', '']
	])('shows %s as %s', (input, expected) => {
		expect(displayLink(input)).toBe(expected)
	})
})

describe('captionLayout', () => {
	it('leaves the image square when there is no caption', () => {
		expect(captionLayout(1000, { label: ' ', link: '' }, measure)).toEqual({
			height: 1000,
			lines: [],
			overflow: false
		})
	})

	it('puts the label above the link, both under the code panel', () => {
		const layout = captionLayout(
			1000,
			{ label: 'Join PauseAI UK', link: 'pauseai.uk/join' },
			measure
		)
		expect(layout.lines.map((l) => [l.kind, l.text])).toEqual([
			['label', 'Join PauseAI UK'],
			['link', 'pauseai.uk/join']
		])
		expect(layout.lines[0].baseline).toBeGreaterThan(1000)
		expect(layout.lines[1].baseline).toBeGreaterThan(layout.lines[0].baseline)
		expect(layout.height).toBeGreaterThan(layout.lines[1].baseline)
		expect(layout.overflow).toBe(false)
	})

	it('wraps a long label onto a second line', () => {
		const layout = captionLayout(
			1000,
			{ label: 'Come to our next meeting in central London', link: '' },
			measure
		)
		expect(layout.lines.length).toBe(2)
		expect(layout.overflow).toBe(false)
	})

	it('flags a link too long to fit even at its smallest size', () => {
		const layout = captionLayout(1000, { label: '', link: `pauseai.uk/${'x'.repeat(80)}` }, measure)
		expect(layout.lines).toHaveLength(1)
		expect(layout.overflow).toBe(true)
	})

	it('scales with the image, so every size wraps the same way', () => {
		const caption = { label: 'Come to our next meeting in central London', link: 'pauseai.uk/join' }
		const small = captionLayout(1000, caption, measure)
		const big = captionLayout(2000, caption, measure)
		expect(big.lines.map((l) => l.text)).toEqual(small.lines.map((l) => l.text))
		expect(big.height).toBeCloseTo(small.height * 2, -1)
	})
})

describe('qrSvg with a caption', () => {
	it('grows taller, embeds the fonts and escapes the text', () => {
		const layout = captionLayout(1000, { label: 'Tea & <biscuits>', link: 'pauseai.uk' }, measure)
		const svg = qrSvg(qrShape('https://pauseai.uk', 1000, true), {
			background: '#FFFFFF',
			roundedPanel: false,
			caption: layout,
			fontCss: '@font-face{}'
		})
		expect(svg).toContain(`height="${layout.height}"`)
		expect(svg).toContain('<style>@font-face{}</style>')
		expect(svg).toContain('>Tea &amp; &lt;biscuits&gt;</text>')
		expect(svg).toContain('>pauseai.uk</text>')
	})

	it('is unchanged without one', () => {
		const shape = qrShape('https://pauseai.uk', 1000, true)
		expect(
			qrSvg(shape, {
				background: '#FFFFFF',
				caption: captionLayout(1000, { label: '', link: '' }, measure)
			})
		).toBe(qrSvg(shape, { background: '#FFFFFF' }))
	})
})
