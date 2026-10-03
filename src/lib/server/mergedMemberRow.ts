export type MemberRow = { id: string; fields: Record<string, unknown> }

const MERGED_INTO = 'Merged into'
const EMAIL = 'Email'
const VERIFIED = 'Verified email'
const CONTACT_DETAILS = ['Discord Username', 'Email 2', 'PauseAI Email', 'Phone']

function isBlank(value: unknown): boolean {
	if (value === undefined || value === null) return true
	if (typeof value === 'string') return value.trim() === ''
	if (Array.isArray(value)) return value.length === 0
	return false
}

function normalizedEmail(row: MemberRow): string {
	const email = row.fields[EMAIL]
	return typeof email === 'string' ? email.trim().toLowerCase() : ''
}

/**
 * Picks the Members row a verification click should tick. PauseAI's CRM merges duplicate rows:
 * the merged row is kept and its `Merged into` links to the row that survives.
 *
 * `dataError` is set when the link cannot be followed because the data is wrong; the row the
 * link named is then the one to tick.
 */
export async function memberRowToVerify(
	row: MemberRow,
	findRow: (id: string) => Promise<MemberRow>
): Promise<{ id: string; dataError?: string }> {
	const mergedInto = row.fields[MERGED_INTO]
	if (isBlank(mergedInto)) return { id: row.id }
	if (!Array.isArray(mergedInto) || mergedInto.length !== 1 || typeof mergedInto[0] !== 'string') {
		return { id: row.id, dataError: '"Merged into" does not name exactly one row' }
	}

	const survivor = await findRow(mergedInto[0])
	if (!isBlank(survivor.fields[MERGED_INTO])) {
		return { id: row.id, dataError: '"Merged into" names a row that is itself merged' }
	}

	// The click proves ownership of this row's address only.
	const email = normalizedEmail(row)
	if (!email || email !== normalizedEmail(survivor)) return { id: row.id }

	// Ticking an unverified survivor would vouch for contact details on it that nobody verified.
	const survivorIsSafeToTick =
		survivor.fields[VERIFIED] === true ||
		CONTACT_DETAILS.every((field) => isBlank(survivor.fields[field]))
	return { id: survivorIsSafeToTick ? survivor.id : row.id }
}
