import type { AirtableNationalGroup, NationalGroup } from '$lib/types.js'
import { json } from '@sveltejs/kit'
import { fetchAllPages, type AirtableRecord } from '$lib/airtable.js'

const AIRTABLE_URL = 'https://api.airtable.com/v0/appWPTGqZmUcs3NWu/tblCwP5K6ENpR5qrd'

// Fallback data to use in development if Airtable fetch fails
const FALLBACK_NATIONAL_GROUPS: AirtableRecord<AirtableNationalGroup>[] = [
	{
		id: 'fallback-stub1',
		fields: {
			Name: '[FALLBACK DATA] Example Group 1',
			Notes: 'This is placeholder data shown when Airtable API is unavailable',
			Leader: ['Fall McBack'],
			discord_username: ['noone'],
			onboarding_email: 'fall.mcback@example.com',
			'Legal entity': 'No',
			Overseer: ['anthony@pauseai.info'],
			X: '',
			Discord: '',
			Whatsapp: '',
			website: 'http://example.com',
			linktree: '',
			instagram: '',
			tiktok: '',
			Facebook: ''
		}
	},
	{
		id: 'fallback-stub2',
		fields: {
			Name: '[FALLBACK DATA] Example Group 2',
			Notes: 'etc',
			Leader: ['etc'],
			discord_username: [],
			onboarding_email: '',
			'Legal entity': 'Yes',
			Overseer: ['etc'],
			X: '',
			Discord: '',
			Whatsapp: '',
			website: '',
			linktree: '',
			instagram: '',
			tiktok: '',
			Facebook: ''
		}
	}
]

/**
 * Converts an Airtable record to a NationalGroup object
 */
function recordToNationalGroup(record: AirtableRecord<AirtableNationalGroup>): NationalGroup {
	// Only log in development to avoid cluttering production logs
	if (import.meta.env.DEV) {
		console.log(
			'Record fields for',
			record.fields.Name,
			':',
			JSON.stringify(record.fields, null, 2)
		)
	}

	return {
		id: record.id || 'noId',
		name: record.fields.Name || '',
		notes: record.fields.Notes || '',
		// Use leader_name if available, otherwise just indicate if Leader exists
		leader: record.fields.leader_name
			? record.fields.leader_name[0]
			: record.fields.Leader
				? 'Yes'
				: 'No',
		// The discord_username field name may vary
		discordUsername: record.fields.discord_username ? record.fields.discord_username[0] : '',
		// Include email if available
		email: record.fields.onboarding_email ? record.fields.onboarding_email : '',
		legalEntity: record.fields['Legal entity'] === 'Yes',
		// Overseer is an array of record IDs
		overseer: record.fields.Overseer ? 'Yes' : 'No',
		xLink: record.fields.X || '',
		discordLink: record.fields.Discord || '',
		whatsappLink: record.fields.Whatsapp || '',
		website: record.fields.website || '',
		linktreeLink: record.fields.linktree || '',
		// Add Instagram and TikTok links
		instagramLink: record.fields.instagram || '',
		tiktokLink: record.fields.tiktok || '',
		facebookLink: record.fields.Facebook,
		public: true // Assuming all records are public by default
	}
}

export async function GET({ fetch, setHeaders }) {
	setHeaders({
		'cache-control': 'public, max-age=3600' // 1 hour in seconds
	})

	const records = await fetchAllPages<AirtableNationalGroup>(
		fetch,
		AIRTABLE_URL,
		FALLBACK_NATIONAL_GROUPS
	)

	const out: NationalGroup[] = records
		.map(recordToNationalGroup)
		// Sort alphabetically by name
		.sort((a, b) => a.name.localeCompare(b.name))

	return json(out)
}
