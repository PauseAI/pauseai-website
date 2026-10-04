// The National Chapters list, read from Airtable at most once per TTL per server
// instance and shared by /api/national-groups and the onboarding submit action,
// which checks the chapter question's wording against it on every non-US signup.
// Airtable allows 5 requests a second per base, shared with the nightly sync.
import type { AirtableNationalGroup, NationalGroup } from '$lib/types.js'
import { fetchAllPages, type AirtableRecord } from '$lib/airtable.js'
import { reportError } from '$lib/server/sentry'

const TTL_MS = 10 * 60 * 1000
// The SDK call cannot be aborted; past this the caller stops waiting for it.
const TIMEOUT_MS = 5000

const AIRTABLE_URL = 'https://api.airtable.com/v0/appWPTGqZmUcs3NWu/tblEQJ26hxBAEkaP8'

// Fallback data to use in development if Airtable fetch fails
const FALLBACK_NATIONAL_GROUPS: AirtableRecord<AirtableNationalGroup>[] = [
	{
		id: 'fallback-stub1',
		fields: {
			country: '[FALLBACK DATA] Example Group 1',
			leaders_name: ['Fall McBack'],
			website_email: 'fall.mcback@example.com',
			x: '',
			discord: '',
			whatsapp: '',
			website: 'http://example.com',
			linktree: '',
			instagram: '',
			tiktok: '',
			facebook: '',
			youtube: '',
			linkedin: '',
			luma: '',
			substack: ''
		}
	},
	{
		id: 'fallback-stub2',
		fields: {
			country: '[FALLBACK DATA] Example Group 2',
			leaders_name: ['etc'],
			website_email: '',
			x: '',
			discord: '',
			whatsapp: '',
			website: '',
			linktree: '',
			instagram: '',
			tiktok: '',
			facebook: '',
			youtube: '',
			linkedin: '',
			luma: '',
			substack: ''
		}
	}
]

/**
 * Converts an Airtable record to a NationalGroup object
 */
function recordToNationalGroup(record: AirtableRecord<AirtableNationalGroup>): NationalGroup {
	// Only log in development to avoid cluttering production logs

	let leaderNames = 'No'
	if (record.fields.leaders_name && record.fields.leaders_name.length > 0) {
		leaderNames = record.fields.leaders_name.join(', ')
	}

	return {
		id: record.id || 'noId',
		name: record.fields.country || '',
		leader: leaderNames,
		// The discord_username field name may vary
		// Include email if available
		email: record.fields.website_email ? record.fields.website_email : '',
		xLink: record.fields.x || '',
		discordLink: record.fields.discord || '',
		whatsappLink: record.fields.whatsapp || '',
		website: record.fields.website || '',
		linktreeLink: record.fields.linktree || '',
		// Add Instagram and TikTok links
		instagramLink: record.fields.instagram || '',
		tiktokLink: record.fields.tiktok || '',
		facebookLink: record.fields.facebook || '',
		youtubeLink: record.fields.youtube || '',
		linkedinLink: record.fields.linkedin || '',
		lumaLink: record.fields.luma || '',
		substackLink: record.fields.substack || '',
		public: true, // Assuming all records are public by default
		image: record.fields.image?.[0]?.url || undefined // Use direct URL for national groups images
	}
}

let cached: { groups: NationalGroup[]; readAt: number } | null = null
let pending: Promise<NationalGroup[] | null> | null = null

async function readGroups(): Promise<NationalGroup[]> {
	const records = await fetchAllPages<AirtableNationalGroup>(
		fetch,
		AIRTABLE_URL,
		FALLBACK_NATIONAL_GROUPS,
		{ filterByFormula: 'NOT({inactive})' }
	)
	return (
		records
			.map(recordToNationalGroup)
			// Sort alphabetically by name
			.sort((a, b) => a.name.localeCompare(b.name))
	)
}

async function refresh(): Promise<NationalGroup[] | null> {
	let timer: ReturnType<typeof setTimeout> | undefined
	try {
		const groups = await Promise.race([
			readGroups(),
			new Promise<never>((_, reject) => {
				timer = setTimeout(
					() => reject(new Error(`National groups read took over ${TIMEOUT_MS} ms`)),
					TIMEOUT_MS
				)
			})
		])
		cached = { groups, readAt: Date.now() }
		return groups
	} catch (error) {
		console.error('Reading national groups failed:', error)
		await reportError(error, { operation: 'getNationalGroups', servedStale: cached !== null })
		// The last good list, however old, rather than none.
		return cached?.groups ?? null
	} finally {
		clearTimeout(timer)
	}
}

// Null only when no read has ever succeeded on this instance.
export async function getNationalGroups(): Promise<NationalGroup[] | null> {
	if (cached && Date.now() - cached.readAt < TTL_MS) return cached.groups
	pending ??= refresh().finally(() => (pending = null))
	return pending
}

export function resetNationalGroupsCacheForTests(): void {
	cached = null
	pending = null
}
