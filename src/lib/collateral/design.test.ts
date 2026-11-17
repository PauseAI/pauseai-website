import { describe, expect, it } from 'vitest'
import { clampHeadlineScale } from './design'
import {
	findLink,
	isLumaEventLink,
	isUnreadableLink,
	LintCollector,
	lintLinksInText,
	lintUnreadableUrl,
	splitByScope
} from './lint'

describe('clampHeadlineScale', () => {
	it('keeps the nudge on tidy steps within range', () => {
		expect(clampHeadlineScale(1.1000000001)).toBe(1.1)
		expect(clampHeadlineScale(5)).toBe(1.3)
		expect(clampHeadlineScale(0)).toBe(0.7)
		expect(clampHeadlineScale('big')).toBe(1)
	})
})

describe('LintCollector', () => {
	it('lists each problem once, warnings first', () => {
		const lint = new LintCollector()
		lint.add({ id: 'a', level: 'info', message: 'A' })
		lint.add({ id: 'b', level: 'warn', message: 'B' })
		lint.add({ id: 'a', level: 'info', message: 'A again' })
		expect(lint.finish().map((i) => i.id)).toEqual(['b', 'a'])
	})

	it('flags text that prints too small', () => {
		const lint = new LintCollector()
		lint.noteText(20) // 20 px at 300 dpi is 4.8 pt
		expect(lint.finish(300).map((i) => i.id)).toEqual(['print-small-text'])
	})

	it('ignores text size for digital formats', () => {
		const lint = new LintCollector()
		lint.noteText(4)
		expect(lint.finish()).toEqual([])
	})

	it('reads at any tint when there is no photo behind the text', () => {
		const lint = new LintCollector()
		lint.noteTextBox('Headline', { x: 0, y: 0, w: 10, h: 10 }, [0, 0, 0], true)
		expect(lint.readsAt(0.5, true)).toBe(true)
	})
})

describe('findLink', () => {
	it.each([
		['Online, via this Zoom link: www.tiny.cc/mszoom', 'www.tiny.cc/mszoom'],
		['RSVP at lu.ma/abc123.', 'lu.ma/abc123'],
		['See https://pauseai.uk/join for more', 'https://pauseai.uk/join'],
		['Join PauseAI.uk today', 'PauseAI.uk'],
		['Details (bit.ly/xyz)', 'bit.ly/xyz']
	])('finds the link in %j', (text, link) => {
		expect(findLink(text)).toBe(link)
	})

	it.each([
		'Meet at 7.30pm, e.g. by the fountain',
		"St. Paul's Cathedral, London",
		'Version 3.5 of the plan',
		'Safety before superintelligence'
	])('finds no link in %j', (text) => {
		expect(findLink(text)).toBeNull()
	})
})

describe('lintLinksInText', () => {
	const fields = [
		{ key: 'headline', label: 'Event title', kind: 'textarea' },
		{ key: 'venue', label: 'Venue', kind: 'text' },
		{ key: 'url', label: 'Web address', kind: 'text' },
		{ key: 'date', label: 'Date', kind: 'date' }
	]

	it('flags links in text fields, but not in the web address', () => {
		const lint = new LintCollector()
		lintLinksInText(lint, fields, {
			headline: 'Social',
			venue: 'Online, via www.tiny.cc/mszoom',
			url: 'lu.ma/abc',
			date: '2026-10-01'
		})
		expect(lint.finish()).toEqual([
			expect.objectContaining({
				id: 'link-in-venue',
				level: 'warn',
				message: expect.stringContaining('Venue contains a link (www.tiny.cc/mszoom)')
			})
		])
	})
})

describe('splitByScope', () => {
	it("lists design problems once and keeps each format's own", () => {
		const link = {
			id: 'link-in-venue',
			level: 'warn' as const,
			message: 'Venue contains a link',
			scope: 'design' as const
		}
		const overflow = { id: 'text-overflow', level: 'warn' as const, message: 'Does not fit' }
		const { design, own } = splitByScope([[link, overflow], [link], []])
		expect(design).toEqual([link])
		expect(own).toEqual([[overflow], [], []])
	})
})

describe('unreadable links', () => {
	it.each([
		'lu.ma/eoohwufh',
		'https://lu.ma/5i8wt2xx',
		'lu.ma/pauseai-c9wb',
		'bit.ly/3xYz',
		'www.tiny.cc/mszoom',
		'zoom.us/j/123456789',
		'forms.gle/AbC123'
	])('flags %s', (url) => {
		expect(isUnreadableLink(url)).toBe(true)
	})

	it.each([
		'pauseai.uk/events',
		'luma.com/pauseai.uk',
		'lu.ma/pauseai',
		'pauseai.uk/join',
		'pauseai.uk',
		'bit.ly',
		'lu.ma/some-event-name'
	])('does not flag %s', (url) => {
		expect(isUnreadableLink(url)).toBe(false)
	})

	it('tells a Luma event from our calendar, whether or not its name is readable', () => {
		expect(isLumaEventLink('lu.ma/eoohwufh')).toBe(true)
		expect(isLumaEventLink('lu.ma/pauseai-c9wb')).toBe(true)
		expect(isLumaEventLink('lu.ma/some-event-name')).toBe(true)
		expect(isLumaEventLink('luma.com/pauseai.uk')).toBe(false)
	})

	it('adds a note, for every format, when the printed web address is a code', () => {
		const lint = new LintCollector()
		lintUnreadableUrl(lint, { url: 'lu.ma/eoohwufh' })
		expect(lint.finish()).toEqual([
			expect.objectContaining({ id: 'url-unreadable', scope: 'design' })
		])
	})
})
