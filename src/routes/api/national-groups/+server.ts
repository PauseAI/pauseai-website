import type { NationalGroup } from '$lib/types.js'
import { json } from '@sveltejs/kit'
import { fetchAllPages } from '$lib/airtable.js'

const AIRTABLE_URL = 'https://api.airtable.com/v0/appWPTGqZmUcs3NWu/tblCwP5K6ENpR5qrd'

// Fallback data to use in development if Airtable fetch fails
const fallbackNationalGroups: NationalGroup[] = [
	{
		id: 'fallback-stub1',
		name: '[FALLBACK DATA] Example Group 1',
		notes: 'This is placeholder data shown when Airtable API is unavailable',
		leader: 'Fall McBack',
		discordUsername: 'noone',
		email: 'fall.mcback@example.com',
		legalEntity: false,
		overseer: 'anthony@pauseai.info',
		xLink: '',
		discordLink: '',
		whatsappLink: '',
		website: 'http://example.com',
		linktreeLink: '',
		instagramLink: '',
		tiktokLink: '',
		facebookLink: '',
		public: true
	},
	{
		id: 'fallback-stub2',
		name: '[FALLBACK DATA] Example Group 2',
		notes: 'etc',
		leader: 'etc',
		discordUsername: '',
		email: '',
		legalEntity: true,
		overseer: 'etc',
		xLink: '',
		discordLink: '',
		whatsappLink: '',
		website: '',
		linktreeLink: '',
		instagramLink: '',
		tiktokLink: '',
		facebookLink: '',
		public: true
	}
]

/**
 * Converts an Airtable record to a NationalGroup object
 */
function recordToNationalGroup(record: any): NationalGroup {
	// Only log in development to avoid cluttering production logs
	if (import.meta.env.DEV) {
		console.log('Record fields for', record.fields.Name, ':', Object.keys(record.fields))
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
		discordUsername: record.fields.discord_username
			? record.fields.discord_username[0]
			: record.fields['discord_username (from Leader)']
				? record.fields['discord_username (from Leader)'][0]
				: '',
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
		instagramLink: record.fields.Instagram || record.fields.instagram || '',
		tiktokLink: record.fields.TikTok || record.fields.Tiktok || record.fields.tiktok || '',
		facebookLink: record.fields.Facebook || record.fields.facebook,
		public: true // Assuming all records are public by default
	}
}

export async function GET({ fetch, setHeaders }) {
	setHeaders({
		'cache-control': 'public, max-age=3600' // 1 hour in seconds
	})

	const records = await fetchAllPages(
		fetch,
		AIRTABLE_URL,
		fallbackNationalGroups.map((group) => ({
			id: group.id,
			fields: {
				Name: group.name,
				Notes: group.notes,
				Leader: group.leader === 'Yes',
				discord_username: [group.discordUsername],
				email: [group.email],
				'Legal entity': group.legalEntity ? 'Yes' : 'No',
				Overseer: group.overseer === 'Yes',
				X: group.xLink,
				Discord: group.discordLink,
				Whatsapp: group.whatsappLink,
				website: group.website,
				linktree: group.linktreeLink,
				Instagram: group.instagramLink,
				TikTok: group.tiktokLink,
				Facebook: group.facebookLink
			}
		}))
	)

	const out: NationalGroup[] = records
		.map(recordToNationalGroup)
		// Sort alphabetically by name
		.sort((a, b) => a.name.localeCompare(b.name))

	return json(out)
}
