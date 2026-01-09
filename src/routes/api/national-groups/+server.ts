import type { AirtableNationalGroup, NationalGroup } from '$lib/types.js'
import { json } from '@sveltejs/kit'
import { fetchAllPages, type AirtableRecord } from '$lib/airtable.js'
import { generateCacheControlRecord } from '$lib/utils'

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
	if (import.meta.env.DEV) {
		if (record.fields.image?.[0]?.url) {
			console.log(
				'🖼️ Airtable Image URL for',
				record.fields.country,
				':',
				record.fields.image[0].url
			)
		}
	}

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
