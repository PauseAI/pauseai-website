import type { NationalGroup } from '$lib/types.js'
import { json, error } from '@sveltejs/kit'
import { fetchAllPages } from '$lib/airtable.js'

/**
 * Converts an Airtable record to a NationalGroup object
 */
function recordToNationalGroup(record: any): NationalGroup {
	// Debug: Log all field names to help identify the Linktree field
	console.log('Record fields for', record.fields.Name, ':', Object.keys(record.fields))

	// Find any field that might contain a Linktree URL
	let linktreeUrl = ''

	// First check for fields with 'linktree' in the value
	for (const [key, value] of Object.entries(record.fields)) {
		if (typeof value === 'string' && value.includes('linktree.com')) {
			console.log('Found Linktree URL in field:', key, value)
			linktreeUrl = value
			break
		} else if (Array.isArray(value)) {
			const linktreeItem = value.find(
				(item) => typeof item === 'string' && item.includes('linktree.com')
			)
			if (linktreeItem) {
				console.log('Found Linktree URL in array field:', key, linktreeItem)
				linktreeUrl = linktreeItem
				break
			}
		}
	}

	// If no Linktree URL found, check for fields with 'link' in the name that might be Linktree
	if (!linktreeUrl) {
		for (const [key, value] of Object.entries(record.fields)) {
			if (
				key.toLowerCase().includes('link') &&
				key.toLowerCase() !== 'x' &&
				key.toLowerCase() !== 'discord' &&
				key.toLowerCase() !== 'whatsapp' &&
				key.toLowerCase() !== 'website'
			) {
				if (typeof value === 'string' && value) {
					console.log('Potential Linktree URL in link field:', key, value)
					if (value.includes('linktree.com')) {
						linktreeUrl = value
						break
					}
				}
			}
		}
	}

	// Check if the notes field contains a Linktree URL
	if (!linktreeUrl && record.fields.Notes) {
		const notes = record.fields.Notes
		const linktreeMatch = notes.match(/https?:\/\/(?:www\.)?linktree\.com\/[^\s)]+/)
		if (linktreeMatch) {
			console.log('Found Linktree URL in notes:', linktreeMatch[0])
			linktreeUrl = linktreeMatch[0]
		}
	}

	// Check for fields that might contain social media links
	if (!linktreeUrl) {
		const socialMediaFieldNames = ['social', 'media', 'socials', 'social media', 'links']
		for (const [key, value] of Object.entries(record.fields)) {
			if (socialMediaFieldNames.some((term) => key.toLowerCase().includes(term))) {
				if (typeof value === 'string' && value.includes('linktree.com')) {
					console.log('Found Linktree URL in social media field:', key, value)
					linktreeUrl = value
					break
				}
			}
		}
	}

	// Extract the notes without the Linktree URL if it was found there
	let notes = record.fields.Notes || ''
	if (linktreeUrl && notes.includes(linktreeUrl)) {
		notes = notes.replace(linktreeUrl, '').trim()
	}

	return {
		id: record.id || 'noId',
		name: record.fields.Name || '',
		notes: notes,
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
		email: record.fields.email ? record.fields.email[0] : '',
		legalEntity: record.fields['Legal entity'] === 'Yes',
		// Overseer is an array of record IDs
		overseer: record.fields.Overseer ? 'Yes' : 'No',
		xLink: record.fields.X || '',
		discordLink: record.fields.Discord || '',
		whatsappLink: record.fields.Whatsapp || '',
		website: record.fields.website || '',
		// Use the discovered Linktree URL or check specific fields
		linktreeLink:
			linktreeUrl ||
			record.fields.Linktree ||
			record.fields.linktree ||
			record.fields.LinkTree ||
			record.fields['Link Tree'] ||
			record.fields['link tree'] ||
			'',
		// Add Instagram and TikTok links
		instagramLink: record.fields.Instagram || record.fields.instagram || '',
		tiktokLink: record.fields.TikTok || record.fields.Tiktok || record.fields.tiktok || '',
		public: true // Assuming all records are public by default
	}
}

export async function GET({ fetch, setHeaders }) {
	// Try different approaches to the table name/ID
	// Option 1: Using the table name directly
	const url = `https://api.airtable.com/v0/appWPTGqZmUcs3NWu/National%20Groups`

	// Option 2: Using the table ID from the screenshot
	// const url = `https://api.airtable.com/v0/appWPTGqZmUcs3NWu/tblCwP5K6ENpR5qrd`

	setHeaders({
		'cache-control': 'public, max-age=3600' // 1 hour in seconds
	})

	try {
		const records = await fetchAllPages(fetch, url)

		// Debug: Log field names from the first record to help identify the correct field name for Linktree
		if (records.length > 0) {
			console.log('Available fields in first record:', Object.keys(records[0].fields))
		}

		const out: NationalGroup[] = records
			.map(recordToNationalGroup)
			// Sort alphabetically by name
			.sort((a, b) => a.name.localeCompare(b.name))

		// Add test social media links to the first group for testing
		if (out.length > 0) {
			out[0].linktreeLink = 'https://linktr.ee/pauseai'
			out[0].instagramLink = 'https://instagram.com/pauseai'
			out[0].tiktokLink = 'https://tiktok.com/@pauseai'
			console.log('Added test social media links to:', out[0].name)
		}

		return json(out)
	} catch (e) {
		console.error('Error fetching national groups:', e)
		return error(500, e instanceof Error ? e.message : 'Failed to fetch national groups')
	}
}
