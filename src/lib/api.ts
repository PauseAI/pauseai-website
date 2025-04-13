import { env } from '$env/dynamic/private'

const { AIRTABLE_API_KEY } = env

/** Helper to check if we have a valid API key */
export const hasValidApiKey = () => {
	return !!AIRTABLE_API_KEY && AIRTABLE_API_KEY.length > 0
}

if (!hasValidApiKey()) {
	if (import.meta.env.MODE !== 'development') {
		throw new Error('AIRTABLE_API_KEY is required in production environment. Build failed.')
	} else {
		console.warn(
			'⚠️ AIRTABLE_API_KEY is not set. Airtable features will use fallback data in development.'
		)
	}
}

/** Fetch options for getting data from Airtable */
export const options = {
	method: 'GET',
	headers: {
		Authorization: `Bearer ${AIRTABLE_API_KEY || ''}`,
		'Content-Type': 'application/json'
	}
}
