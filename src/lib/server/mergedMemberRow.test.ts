import { describe, expect, it, vi } from 'vitest'
import { memberRowToVerify, type MemberRow } from './mergedMemberRow.js'

const merged = (fields: Record<string, unknown> = {}): MemberRow => ({
	id: 'recMerged',
	fields: { Email: 'ada@example.org', 'Merged into': ['recSurvivor'], ...fields }
})

const survivor = (fields: Record<string, unknown> = {}): MemberRow => ({
	id: 'recSurvivor',
	fields: { Email: 'ada@example.org', ...fields }
})

const finder = (...rows: MemberRow[]) =>
	vi.fn((id: string) => {
		const row = rows.find((candidate) => candidate.id === id)
		return row ? Promise.resolve(row) : Promise.reject(new Error(`no row ${id}`))
	})

describe('memberRowToVerify', () => {
	it('ticks the row itself, without a second read, when it was not merged', async () => {
		const findRow = finder()
		const row = { id: 'recPlain', fields: { Email: 'ada@example.org' } }
		expect(await memberRowToVerify(row, findRow)).toEqual({ id: 'recPlain' })
		expect(findRow).not.toHaveBeenCalled()
	})

	it('follows to a verified survivor with the same email, whatever it holds', async () => {
		const findRow = finder(survivor({ 'Verified email': true, 'Discord Username': 'ada' }))
		expect(await memberRowToVerify(merged(), findRow)).toEqual({ id: 'recSurvivor' })
	})

	it('compares emails trimmed and lowercased', async () => {
		const findRow = finder(survivor({ Email: ' Ada@Example.org ', 'Verified email': true }))
		expect(await memberRowToVerify(merged(), findRow)).toEqual({ id: 'recSurvivor' })
	})

	it("normalises the named row's email as well as the survivor's", async () => {
		const findRow = finder(survivor({ 'Verified email': true }))
		expect(await memberRowToVerify(merged({ Email: ' ADA@example.ORG ' }), findRow)).toEqual({
			id: 'recSurvivor'
		})
	})

	it('follows to an unverified survivor that holds no contact details', async () => {
		const findRow = finder(survivor({ 'Discord Username': ' ', Phone: '' }))
		expect(await memberRowToVerify(merged(), findRow)).toEqual({ id: 'recSurvivor' })
	})

	it.each(['Discord Username', 'Email 2', 'PauseAI Email', 'Phone'])(
		'does not follow to an unverified survivor holding %s',
		async (field) => {
			const findRow = finder(survivor({ [field]: 'something' }))
			expect(await memberRowToVerify(merged(), findRow)).toEqual({ id: 'recMerged' })
		}
	)

	it('does not follow when the survivor has a different email', async () => {
		const findRow = finder(survivor({ Email: 'grace@example.org', 'Verified email': true }))
		expect(await memberRowToVerify(merged(), findRow)).toEqual({ id: 'recMerged' })
	})

	it('does not follow when neither row has an email', async () => {
		const findRow = finder(survivor({ Email: undefined, 'Verified email': true }))
		expect(await memberRowToVerify(merged({ Email: undefined }), findRow)).toEqual({
			id: 'recMerged'
		})
	})

	it('treats two targets as a data error and reads neither', async () => {
		const findRow = finder(survivor({ 'Verified email': true }))
		const result = await memberRowToVerify(
			merged({ 'Merged into': ['recSurvivor', 'recOther'] }),
			findRow
		)
		expect(result.id).toBe('recMerged')
		expect(result.dataError).toBeTruthy()
		expect(findRow).not.toHaveBeenCalled()
	})

	it('treats a target that is itself merged as a data error', async () => {
		const findRow = finder(survivor({ 'Verified email': true, 'Merged into': ['recFinal'] }))
		const result = await memberRowToVerify(merged(), findRow)
		expect(result.id).toBe('recMerged')
		expect(result.dataError).toBeTruthy()
		expect(findRow).toHaveBeenCalledTimes(1)
	})
})
