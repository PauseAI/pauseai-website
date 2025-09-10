import { v2 as cloudinary } from 'cloudinary'
import { env } from '$env/dynamic/private'
import { json } from '@sveltejs/kit'

// Configure Cloudinary with credentials
// Cloud name and API key have defaults, only secret must be set
cloudinary.config({
	cloud_name: env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyjlw1syg',
	api_key: env.CLOUDINARY_API_KEY || '779717836612829',
	api_secret: env.CLOUDINARY_API_SECRET
})

// Check if we have the required secret configured
export function hasCloudinaryCredentials(): boolean {
	return !!env.CLOUDINARY_API_SECRET
}

// Returns error response for missing credentials
export function credentialsError() {
	console.error('Cloudinary API secret not configured')
	return json({ error: 'Service not configured. Please contact support.' }, { status: 503 })
}

export default cloudinary
