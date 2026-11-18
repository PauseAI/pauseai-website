import { describe, expect, it } from 'vitest'
import { MAX_EMBEDDED_PHOTO_CHARS, parseProject, serializeProject, type Project } from './project'

const project: Project = {
	chapterId: 'United Kingdom',
	formatId: 'a5',
	templateId: 'event',
	themeId: 'cream',
	values: { event: { headline: 'Letter writing night', date: '2026-10-15', start: '19:00' } },
	qrCodes: {
		event: [
			{ label: 'RSVP', url: 'luma.com/pauseai.uk' },
			{ label: 'Join WhatsApp', url: 'pauseai.uk/join' }
		],
		announcement: [{ label: 'Join', url: 'pauseai.uk/join' }]
	},
	trackQr: false,
	qrSize: 'l',
	photo: { kind: 'library', id: 'london-2025' },
	photoClear: true,
	coverTitle: false,
	partnerLogos: [{ name: 'partner.png', dataUrl: 'data:image/png;base64,iVBORw0KGgo=' }],
	photoSettings: { zoom: 2, focalX: 0.2, focalY: 0.8 },
	headlineScale: 1.2,
	screenQr: true
}

function withEdit(edit: (o: Record<string, unknown>) => void): string {
	const o = JSON.parse(serializeProject(project)) as Record<string, unknown>
	edit(o)
	return JSON.stringify(o)
}

describe('serializeProject / parseProject', () => {
	it('round-trips a project', () => {
		const result = parseProject(serializeProject(project))
		expect(result).toEqual({ ok: true, project })
	})

	it('marks the file with the app name, version and save time', () => {
		const o = JSON.parse(serializeProject(project, new Date('2026-09-21T10:00:00Z'))) as Record<
			string,
			unknown
		>
		expect(o).toMatchObject({
			app: 'pauseai-collateral',
			version: 1,
			savedAt: '2026-09-21T10:00:00.000Z'
		})
	})

	it('round-trips an embedded uploaded photo', () => {
		const upload = {
			kind: 'upload' as const,
			name: 'me.jpg',
			dataUrl: 'data:image/jpeg;base64,/9j/4AAQ'
		}
		const result = parseProject(serializeProject({ ...project, photo: upload }))
		expect(result.ok && result.project.photo).toEqual(upload)
	})
})

describe('parseProject rejects bad files', () => {
	it('rejects non-JSON', () => {
		expect(parseProject('nope').ok).toBe(false)
	})

	it('rejects JSON from something else', () => {
		expect(parseProject('{"hello":"world"}').ok).toBe(false)
		expect(parseProject('[1,2]').ok).toBe(false)
	})

	it('rejects files from a newer version', () => {
		const result = parseProject(withEdit((o) => (o.version = 99)))
		expect(result).toMatchObject({ ok: false, error: expect.stringMatching(/newer/) as string })
	})
})

describe('parseProject cleans untrusted content', () => {
	it('falls back to defaults for unknown format, layout and style ids', () => {
		const result = parseProject(
			withEdit((o) => Object.assign(o, { formatId: '??', templateId: '??', themeId: '??' }))
		)
		expect(result.ok && result.project).toMatchObject({
			formatId: 'ig-square',
			templateId: 'announcement',
			themeId: 'orange'
		})
	})

	it('drops unknown text fields and trims over-long values', () => {
		const result = parseProject(
			withEdit((o) => (o.values = { event: { headline: 'x'.repeat(500), evil: 'y', date: 5 } }))
		)
		expect(result.ok).toBe(true)
		if (!result.ok) return
		expect(result.project.values.event.headline).toHaveLength(80)
		expect(result.project.values.event).not.toHaveProperty('evil')
		expect(result.project.values.event).not.toHaveProperty('date')
	})

	it('keeps at most four QR codes per layout, with clamped text', () => {
		const many = Array.from({ length: 9 }, (_, i) => ({
			label: 'L'.repeat(99),
			url: `example.com/${i}`
		}))
		const result = parseProject(withEdit((o) => (o.qrCodes = { event: many, nope: many })))
		expect(result.ok && Object.keys(result.project.qrCodes)).toEqual(['event'])
		expect(result.ok && result.project.qrCodes.event).toHaveLength(4)
		expect(result.ok && result.project.qrCodes.event[0].label).toHaveLength(32)
	})

	it('gives the single QR code list of an older file to the layout it was saved on', () => {
		const codes = [{ label: 'RSVP', url: 'lu.ma/abc' }]
		const result = parseProject(withEdit((o) => (o.qrCodes = codes)))
		expect(result.ok && result.project.qrCodes).toEqual({ event: codes })
	})

	it('falls back to PauseAI as a whole for unknown chapters, and files from before chapters', () => {
		const unknown = parseProject(withEdit((o) => (o.chapterId = 'Atlantis')))
		expect(unknown.ok && unknown.project.chapterId).toBe('')
		const older = parseProject(withEdit((o) => delete o.chapterId))
		expect(older.ok && older.project.chapterId).toBe('')
	})

	it('ignores unknown library photos', () => {
		const result = parseProject(
			withEdit((o) => (o.photo = { kind: 'library', id: '../../etc/passwd' }))
		)
		expect(result.ok && result.project.photo).toBeNull()
	})

	it('only accepts embedded raster images', () => {
		const svg = parseProject(
			withEdit(
				(o) =>
					(o.photo = { kind: 'upload', name: 'x', dataUrl: 'data:image/svg+xml;base64,PHN2Zz4=' })
			)
		)
		const js = parseProject(
			withEdit((o) => (o.photo = { kind: 'upload', name: 'x', dataUrl: 'javascript:alert(1)' }))
		)
		const remote = parseProject(
			withEdit(
				(o) => (o.photo = { kind: 'upload', name: 'x', dataUrl: 'https://evil.example/a.png' })
			)
		)
		for (const r of [svg, js, remote]) expect(r.ok && r.project.photo).toBeNull()
	})

	it('rejects embedded photos over the size cap', () => {
		const huge = `data:image/png;base64,${'A'.repeat(MAX_EMBEDDED_PHOTO_CHARS)}`
		const result = parseProject(
			withEdit((o) => (o.photo = { kind: 'upload', name: 'x', dataUrl: huge }))
		)
		expect(result.ok && result.project.photo).toBeNull()
	})

	it('drops free-text dates and times from older saves, so the date and time pickers get their defaults', () => {
		const result = parseProject(
			withEdit(
				(o) =>
					(o.values = {
						event: { date: 'Thursday 15 October', start: '7pm', end: '', time: '7pm' }
					})
			)
		)
		expect(result.ok && result.project.values.event).toEqual({ end: '' })
	})

	it('opens a design saved with the retired Clear style as Cream', () => {
		const result = parseProject(withEdit((o) => Object.assign(o, { themeId: 'clear' })))
		expect(result.ok && result.project).toMatchObject({ themeId: 'cream' })
	})

	it('drops settings the tool no longer offers from older files', () => {
		const result = parseProject(
			withEdit((o) => Object.assign(o, { tint: 'strong', align: 'center', qrSize: 's' }))
		)
		expect(result.ok && result.project).toEqual({ ...project, qrSize: 'm' })
	})

	it('clamps photo settings and ignores the colour strength older files saved with them', () => {
		const result = parseProject(
			withEdit((o) => (o.photoSettings = { zoom: 99, focalX: -5, focalY: 'a', visible: 9 }))
		)
		expect(result.ok && result.project.photoSettings).toEqual({ zoom: 4, focalX: 0, focalY: 0.5 })
	})

	it('defaults newer fields that an older file does not have', () => {
		const result = parseProject(
			withEdit((o) => {
				for (const k of ['qrSize', 'partnerLogos', 'headlineScale']) delete o[k]
			})
		)
		expect(result.ok && result.project).toMatchObject({
			qrSize: 'm',
			partnerLogos: [],
			headlineScale: 1
		})
	})

	it('clamps the title size nudge and rejects unknown QR sizes', () => {
		const result = parseProject(
			withEdit((o) => Object.assign(o, { headlineScale: 9, qrSize: 'xl' }))
		)
		expect(result.ok && result.project).toMatchObject({ headlineScale: 1.3, qrSize: 'm' })
	})

	it('only accepts raster partner logos, at most two', () => {
		const png = { name: 'a', dataUrl: 'data:image/png;base64,iVBORw0KGgo=' }
		const svg = { name: 'b', dataUrl: 'data:image/svg+xml;base64,PHN2Zz4=' }
		const result = parseProject(withEdit((o) => (o.partnerLogos = [svg, png, png, png])))
		expect(result.ok && result.project.partnerLogos).toEqual([png, png])
	})
})
