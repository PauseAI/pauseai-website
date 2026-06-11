// Temporary stand-in for the Airtable write during onboarding-pipeline testing.
// Submissions are held in memory (per server process, capped) and rendered at
// /onboarding/stub so we can inspect exactly what would be sent to Airtable.
// Swap recordStubSubmission() for createRecord() in $lib/airtable when going live.

export type OnboardingStubSubmission = {
	id: number
	receivedAt: string
	airtable: {
		baseId: string
		tableId: string
		tableName: string
	}
	fields: Record<string, unknown>
	meta: Record<string, unknown>
}

const MAX_SUBMISSIONS = 50

const submissions: OnboardingStubSubmission[] = []
let nextId = 1

export function recordStubSubmission(
	submission: Omit<OnboardingStubSubmission, 'id' | 'receivedAt'>
): OnboardingStubSubmission {
	const stored: OnboardingStubSubmission = {
		id: nextId++,
		receivedAt: new Date().toISOString(),
		...submission
	}
	submissions.unshift(stored)
	if (submissions.length > MAX_SUBMISSIONS) submissions.length = MAX_SUBMISSIONS
	console.log(
		`[onboarding stub] would create Airtable record in ${submission.airtable.tableName}:`,
		JSON.stringify(submission.fields, null, 2)
	)
	return stored
}

export function getStubSubmissions(): OnboardingStubSubmission[] {
	return submissions
}
