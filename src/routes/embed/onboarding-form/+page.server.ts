// Onboarding submit action — shared by step 2, browse signup, and step 3
// volunteer update. See docs/join-form-flow.md for the full flow contract
// (fields, validation, live/stub branches). Keep that document in sync when
// changing the action's inputs or behavior.
import { fail } from '@sveltejs/kit'
import type { FieldSet } from 'airtable'
import type { Actions } from './$types'
import type { NationalGroupsApiResponse } from '$api/national-groups/+server.js'
import { createRecord, updateRecord } from '$lib/airtable'
import { isOnboardingLive } from '$lib/server/onboarding'
import { recordStubSubmission } from '$lib/server/onboarding-stub'
import { subscribeToSubstackNewsletter } from '$lib/server/substack'
import { checkNotSpam } from '$lib/server/turnstile-verify'
import {
	COUNTRIES,
	DISCOVERY_OPTIONS,
	INTENTS,
	LANGUAGES,
	MOTIVATIONS,
	SIGNUP_SOURCE,
	SUBSCRIBE_SIGNUP_SOURCE,
	SKILLS,
	WEEKLY_HOURS,
	type Intent
} from '$lib/components/onboarding/options'

export const prerender = false

// Write target per the Plan of Action: base "PauseAI Volunteers & Actions",
// table "Members".
const AIRTABLE_BASE_ID = 'appWPTGqZmUcs3NWu'
const MEMBERS_TABLE_ID = 'tblL1icZBhTV1gQ9o'

const STORED_LANGUAGES = LANGUAGES.map((l) => l.stored)

function getString(formData: FormData, field: string): string {
	const value = formData.get(field)
	return typeof value === 'string' ? value.trim() : ''
}

function getStrings(formData: FormData, field: string): string[] {
	return formData
		.getAll(field)
		.filter((value): value is string => typeof value === 'string')
		.map((value) => value.trim())
		.filter(Boolean)
}

function isIntent(value: string): value is Intent {
	return (INTENTS as readonly string[]).includes(value)
}

async function lookupChapter(
	customFetch: typeof fetch,
	country: string
): Promise<{ name: string; leader: string } | null> {
	try {
		const response = await customFetch('/api/national-groups')
		if (!response.ok) return null
		const groups = (await response.json()) as NationalGroupsApiResponse
		const match = groups.find((group) => group.name.toLowerCase() === country.toLowerCase())
		return match ? { name: match.name, leader: match.leader } : null
	} catch (error) {
		console.error('Chapter lookup failed:', error)
		return null
	}
}

export const actions: Actions = {
	submit: async ({ request, fetch, url }) => {
		const data = await request.formData()

		// Honeypot
		if (getString(data, 'nickname')) {
			return { success: true }
		}

		// Read once, so the check below and the writes at the end can't disagree.
		const live = isOnboardingLive()

		// Only when the submission writes: a preview can't produce a token at all
		// (its hostname isn't allowed by the site key), and stub mode writes nothing.
		if (live) {
			const spam = await checkNotSpam(data, url.hostname)
			if (spam.drop) return { success: true }
			if (spam.message) return fail(403, { message: spam.message })
		}

		const fullName = getString(data, 'full_name')
		const email = getString(data, 'email')
		const country = getString(data, 'country')
		const city = getString(data, 'city')
		const intent = getString(data, 'intent')
		const mode = getString(data, 'mode') === 'browse' ? 'browse' : 'contact'
		const newsletter = data.get('newsletter') === 'on'
		const keepInformed = data.get('keep_informed') === 'on'
		// GDPR consent (bundled with local-chapter sharing) gates every
		// record-creating submission. Step 3 volunteer posts update an existing
		// record and carry no checkbox, so the check below exempts updates.
		const gdprAgreed = data.get('agree_gdpr') === 'on'
		// Set when a step-2 submission already created the person's record:
		// the later volunteer-form submission updates it instead of creating a
		// duplicate. Step 2 sends every path through here, so the newsletter
		// and Substack subscription happen right after step 2.
		const existingRecordId = getString(data, 'record_id')
		// The volunteer detail fields are only present on the step-3 form post.
		const hasVolunteerDetails = data.get('volunteer_details') === 'on'
		// The /subscribe newsletter form. It requires the same four fields as /join,
		// but decouples chapter sharing from the privacy consent: the /join form
		// bundles the two, this one shares only on an explicit local-chapter tick.
		const isSubscribeForm = data.get('subscribe_form') === '1'
		const wantsChapter = data.get('chapter_share') === 'on'

		// Creates (both forms) require all four fields; an update (the volunteer
		// step, or the subscribe "do more" hand-off) patches an existing record and
		// skips the check, so it can't re-require what the original create collected.
		if (!existingRecordId && (!fullName || !email || !country || !city)) {
			return fail(400, { message: 'Please fill in your name, email, country and city.' })
		}
		if (!/^\S+@\S+\.\S+$/.test(email)) {
			return fail(400, { message: 'Please enter a valid email address.' })
		}
		if (country && !COUNTRIES.includes(country)) {
			return fail(400, { message: 'Please select a country from the list.' })
		}
		if (!isIntent(intent)) {
			return fail(400, { message: 'Please choose what brings you here.' })
		}
		// Updates (volunteer step 3) carry an existing record id and already
		// consented at step 2; require consent only when creating a record.
		if (!existingRecordId && !gdprAgreed) {
			return fail(400, { message: 'Please agree to the data processing consent to continue.' })
		}

		// Chapter sharing:
		//  - /join create bundles it into the single privacy checkbox -> true
		//  - /subscribe create shares only when they tick the local-updates box
		//  - an update (the /subscribe "do more" hand-off, or the volunteer step)
		//    leaves the signup-time choice alone, except Volunteer/Lead, whose
		//    local involvement means they hear from a chapter regardless
		let chapterShare: boolean | undefined
		if (existingRecordId) {
			if (intent === 'Volunteer' || intent === 'Lead') chapterShare = true
			// The subscribe "do more" step reposts the signup-time choice, so backing
			// out of Volunteer/Lead restores it rather than leaving the escalation.
			else if (isSubscribeForm) chapterShare = wantsChapter
		} else {
			chapterShare = isSubscribeForm ? wantsChapter : true
		}

		const fields: FieldSet = {
			Email: email,
			Intent: intent,
			'Email subscription': keepInformed,
			// Signing up is itself the privacy-policy consent: the /join checkbox
			// and the /subscribe microcopy both link it.
			'Data privacy policy agreed': true
		}
		// Which form produced the row — provenance, so it's written once at create and
		// never on an update, or the volunteer step (which carries no subscribe marker)
		// would rewrite a /subscribe row as a /join one.
		if (!existingRecordId) {
			fields['Signup source'] = isSubscribeForm ? SUBSCRIBE_SIGNUP_SOURCE : SIGNUP_SOURCE
		}
		// A create always writes the basics (they're validated above). An update only
		// overwrites them when non-empty, so a partial post can't blank what the
		// create collected.
		if (!existingRecordId || fullName) fields['Full name'] = fullName
		if (!existingRecordId || country) fields.Country = country
		if (!existingRecordId || city) fields.City = city
		if (chapterShare !== undefined) {
			fields['GDPR chapter share permission'] = chapterShare
		}

		if (intent === 'Volunteer' && hasVolunteerDetails) {
			const languages = getStrings(data, 'languages').filter((l) => STORED_LANGUAGES.includes(l))
			const motivations = getStrings(data, 'motivations').filter((m) => MOTIVATIONS.includes(m))
			const skills = getStrings(data, 'skills').filter((s) => SKILLS.includes(s))
			const discovery = getString(data, 'discovery')
			const hours = getString(data, 'hours')

			if (!languages.length) {
				return fail(400, { message: 'Please select at least one language you speak.' })
			}
			if (!WEEKLY_HOURS.includes(hours)) {
				return fail(400, { message: 'Please tell us how much time you can commit weekly.' })
			}
			if (data.get('agree_volunteer') !== 'on' || data.get('agree_conduct') !== 'on') {
				return fail(400, {
					message: 'Please agree to the Volunteer Agreement and Code of Conduct.'
				})
			}
			if (discovery && !DISCOVERY_OPTIONS.includes(discovery)) {
				return fail(400, { message: 'Please select a valid option for how you found us.' })
			}

			fields['Discord Username'] = getString(data, 'discord_username')
			fields['Phone'] = getString(data, 'phone')
			fields['Languages'] = languages
			fields['Other languages'] = getString(data, 'languages_other')
			if (discovery) {
				fields['Discovery method of PAI'] = discovery
			}
			fields['Discovery method of PAI (Other)'] = getString(data, 'discovery_specify')
			fields['Motivation'] = motivations
			fields['Motivation (Other)'] = getString(data, 'motivations_other')
			fields['Skills & Interests'] = skills
			fields['Skill & Interests (Other)'] = getString(data, 'skills_other')
			fields['Projected weekly hours'] = hours
			fields['Volunteer Agreement'] = true
			fields['Code of Conduct agreed'] = true
			fields['Paying Interest'] = data.get('become_paying_member') === 'on'

			if (country === 'United States') {
				fields['Zip code'] = getString(data, 'zip_code')
			}
		}

		if (live) {
			let recordId: string | undefined = existingRecordId || undefined
			if (recordId) {
				const updated = await updateRecord(AIRTABLE_BASE_ID, MEMBERS_TABLE_ID, recordId, fields)
				if (!updated) {
					return fail(502, { message: 'Sorry, we could not save your details. Please try again.' })
				}
			} else {
				recordId = await createRecord(AIRTABLE_BASE_ID, MEMBERS_TABLE_ID, fields)
				// A failed write returns undefined; surface it instead of telling
				// the user they're signed up when no record was created.
				if (!recordId) {
					return fail(502, { message: 'Sorry, we could not save your details. Please try again.' })
				}
				// Subscription happens on the initial (step 2) submission only;
				// the volunteer-form update never re-subscribes.
				if (newsletter) {
					await subscribeToSubstackNewsletter(email)
				}
			}
			return { success: true, recordId }
		}

		// Chapter routing is recorded only for stub inspection; notifying the
		// chapter stays a manual Airtable process (plan decision 6). The live
		// branch never reads it, so it's resolved here rather than on every submit.
		const chapter = await lookupChapter(fetch, country)
		const submission = recordStubSubmission({
			airtable: {
				baseId: AIRTABLE_BASE_ID,
				tableId: MEMBERS_TABLE_ID,
				tableName: 'Members'
			},
			fields,
			meta: {
				mode,
				updatesRecordId: existingRecordId || null,
				chapterMatch: chapter,
				wouldSubscribeToSubstackNewsletter: newsletter && !existingRecordId,
				stubbed: 'No Airtable write or Substack subscription was performed.'
			}
		})

		return {
			success: true,
			recordId: existingRecordId || `stub-${submission.id}`,
			submission
		}
	}
}
