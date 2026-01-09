import type { AirtableNationalGroup, NationalGroup } from '$lib/types.js'
import { json } from '@sveltejs/kit'
import { fetchAllPages, type AirtableRecord } from '$lib/airtable.js'
import { generateCacheControlRecord } from '$lib/utils'

const AIRTABLE_URL = 'https://api.airtable.com/v0/appWPTGqZmUcs3NWu/tblCwP5K6ENpR5qrd'

// Fallback data to use in development if Airtable fetch fails
const FALLBACK_NATIONAL_GROUPS: AirtableRecord<AirtableNationalGroup>[] = [
	{
		id: 'fallback-stub1',
		fields: {
			Name: 'United States',
			Notes: 'This is placeholder data shown when Airtable API is unavailable',
			Leader: ['Fall McBack'],
			onboarding_email: 'fall.mcback@example.com',
			'Legal entity': 'No',
			X: '',
			Discord: '',
			Whatsapp: '',
			website: 'http://example.com',
			linktree: '',
			instagram: '',
			tiktok: '',
			Facebook: '',
			youtube: '',
			linkedin: '',
			luma: ''
		}
	},
	{
		id: 'fallback-stub2',
		fields: {
			Name: 'Nederland',
			Notes: 'etc',
			Leader: ['etc'],
			onboarding_email: '',
			'Legal entity': 'Yes',
			X: '',
			Discord: '',
			Whatsapp: '',
			website: '',
			linktree: '',
			instagram: '',
			tiktok: '',
			Facebook: '',
			youtube: '',
			linkedin: '',
			luma: ''
		}
	},
	{
		id: 'fallback-stub3',
		fields: {
			Name: 'United Kingdom',
			Notes: 'etc',
			Leader: ['etc'],
			onboarding_email: '',
			'Legal entity': 'Yes',
			X: '',
			Discord: '',
			Whatsapp: '',
			website: '',
			linktree: '',
			instagram: '',
			tiktok: '',
			Facebook: '',
			youtube: '',
			linkedin: '',
			luma: ''
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
		if (record.fields.image?.[0]?.url) {
			console.log('🖼️ Airtable Image URL for', record.fields.Name, ':', record.fields.image[0].url)
		}
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
		// Include email if available
		email: record.fields.onboarding_email ? record.fields.onboarding_email : '',
		legalEntity: record.fields['Legal entity'] === 'Yes',
		xLink: record.fields.X || '',
		discordLink: record.fields.Discord || '',
		whatsappLink: record.fields.Whatsapp || '',
		website: record.fields.website || '',
		linktreeLink: record.fields.linktree || '',
		// Add Instagram and TikTok links
		instagramLink: record.fields.instagram || '',
		tiktokLink: record.fields.tiktok || '',
		facebookLink: record.fields.Facebook || '',
		youtubeLink: record.fields.youtube || '',
		linkedinLink: record.fields.linkedin || '',
		lumaLink: record.fields.luma || '',
		public: true, // Assuming all records are public by default
		image: record.fields.image?.[0]?.url || undefined // Use direct URL for national groups images
	}
}

export async function GET({ fetch, setHeaders }) {
	setHeaders(generateCacheControlRecord({ public: true, maxAge: 60 * 60 }))

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
