import { describe, expect, it } from 'vitest'
import {
	newPackOutput,
	parsePackProject,
	serializePackProject,
	type PackProject
} from './packProject'

const pack: PackProject = {
	chapterId: 'Germany',
	templateId: 'event',
	themeId: 'black',
	values: { event: { headline: 'Public meeting', date: '2026-10-28' } },
	qrCodes: { event: [{ label: 'Scan to RSVP', url: 'lu.ma/abc' }] },
	trackQr: false,
	qrSize: 'm',
	photo: { kind: 'library', id: 'london-2025' },
	photoClear: false,
	coverTitle: true,
	partnerLogos: [],
	// In format list order: social formats come before print.
	outputs: [
		{ ...newPackOutput('ig-square'), screenQr: true },
		newPackOutput('story'),
		{
			formatId: 'a5',
			photoView: { zoom: 1.5, focalX: 0.3, focalY: 0.6 },
			headlineScale: 0.9,
			screenQr: false
		}
	]
}

describe('serializePackProject / parsePackProject', () => {
	it('round-trips a pack', () => {
		expect(parsePackProject(serializePackProject(pack))).toEqual({ ok: true, project: pack })
	})

	it('rejects a single-image project file', () => {
		expect(parsePackProject(JSON.stringify({ app: 'pauseai-collateral', version: 1 })).ok).toBe(
			false
		)
	})

	it('drops unknown and repeated formats, and keeps the format list order', () => {
		const o = JSON.parse(serializePackProject(pack))
		o.outputs = [
			{ formatId: 'story' },
			{ formatId: 'nope' },
			{ formatId: 'a5' },
			{ formatId: 'a5' }
		]
		const result = parsePackProject(JSON.stringify(o))
		expect(result.ok && result.project.outputs.map((x) => x.formatId)).toEqual(['story', 'a5'])
	})

	it("clamps each output's crop and title nudge", () => {
		const o = JSON.parse(serializePackProject(pack))
		o.outputs = [
			{ formatId: 'a5', photoView: { zoom: 50, focalX: 2, focalY: 'x' }, headlineScale: 0.1 }
		]
		const result = parsePackProject(JSON.stringify(o))
		expect(result.ok && result.project.outputs[0]).toEqual({
			formatId: 'a5',
			photoView: { zoom: 4, focalX: 1, focalY: 0.5 },
			headlineScale: 0.7,
			screenQr: false
		})
	})
})
