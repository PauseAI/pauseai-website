// Edge-compatible Cloudinary REST API client
import { env } from '$env/dynamic/private'
import { json } from '@sveltejs/kit'

const CLOUD_NAME = env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyjlw1syg'
const API_KEY = env.CLOUDINARY_API_KEY || '779717836612829'
const API_SECRET = env.CLOUDINARY_API_SECRET

// SHA1 hash using Web Crypto API (works in both Node.js 18+ and Deno)
async function sha1(text: string): Promise<string> {
	const encoder = new TextEncoder()
	const data = encoder.encode(text)
	const hashBuffer = await crypto.subtle.digest('SHA-1', data)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
	return hashHex
}

// Generic Cloudinary REST API caller
export async function callCloudinaryAPI(
	endpoint: string,
	params: Record<string, unknown> = {},
	requiresAuth: 'basic' | 'signature' = 'signature'
) {
	const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${endpoint}`

	if (requiresAuth === 'basic') {
		// Admin API uses basic auth
		// btoa is available in both Deno (native) and Node (via SvelteKit polyfill)
		const auth = btoa(`${API_KEY}:${API_SECRET}`)
		const response = await fetch(url, {
			headers: { Authorization: `Basic ${auth}` }
		})
		if (!response.ok) throw new Error(`API call failed: ${response.status}`)
		return response.json()
	}

	// Upload/management APIs use signed form data
	const timestamp = Math.floor(Date.now() / 1000)
	const allParams: Record<string, unknown> = { ...params, timestamp, api_key: API_KEY }

	// Generate signature from filtered parameters
	// Note: 'file', 'resource_type', 'api_key', and 'signature' are excluded from signature
	const paramsToSign = Object.keys(allParams)
		.sort()
		.filter(
			(k) =>
				allParams[k] !== undefined &&
				k !== 'api_key' &&
				k !== 'signature' &&
				k !== 'file' &&
				k !== 'resource_type'
		)
		.map((k) => `${k}=${allParams[k]}`)
		.join('&')

	// Use Web Crypto API for SHA1 hashing (works in both Node.js 18+ and Deno)
	const signature = await sha1(paramsToSign + API_SECRET)
	allParams.signature = signature

	// Build form data
	const formData = new FormData()
	Object.entries(allParams).forEach(([key, value]) => {
		if (value !== undefined) {
			// Handle arrays by converting to comma-separated string
			if (Array.isArray(value)) {
				formData.append(key, value.join(','))
			} else {
				formData.append(key, String(value))
			}
		}
	})

	const response = await fetch(url, { method: 'POST', body: formData })
	if (!response.ok) throw new Error(`API call failed: ${response.status}`)
	return response.json()
}

// Check if we have the required secret configured
export function hasCloudinaryCredentials(): boolean {
	return !!API_SECRET
}

// Returns error response for missing credentials
export function credentialsError() {
	console.error('Cloudinary API secret not configured')
	return json({ error: 'Service not configured. Please contact support.' }, { status: 503 })
}
