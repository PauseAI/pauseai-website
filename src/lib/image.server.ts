// The import.meta.glob calls below expand into a large map of every asset
// under src/assets/images. Keeping this module .server-only ensures that map
// is never bundled into the client — server load functions resolve images
// here and pass only the resulting URLs/Picture objects to the client.
// See docs/image-processing.md for the full architecture.
import type { Picture } from '$lib/types'

const BASE = '../assets/images'

const IMAGE_URLS = import.meta.glob<string>('../assets/images/**/*', {
	eager: true,
	import: 'default',
	query: { url: true }
})

const PICTURES = import.meta.glob<Picture>(
	'../assets/images/**/*.{avif,heif,gif,jpeg,jpg,png,tiff,webp}',
	{
		eager: true,
		import: 'default',
		query: {
			picture: true
		}
	}
)

const METADATA_IMAGE_URLS = import.meta.glob<string>('../assets/images/**/*', {
	eager: true,
	import: 'default',
	query: {
		meta: true
	}
})

function toAssetModulePath(imagePath: string) {
	return BASE + imagePath
}

export function resolveImageUrl(imagePath: string) {
	const relativePath = toAssetModulePath(imagePath)
	if (IMAGE_URLS[relativePath]) {
		return IMAGE_URLS[relativePath]
	}
	return imagePath
}

export function resolvePicture(imagePath: string): Picture | null {
	const relativePath = toAssetModulePath(imagePath)
	return PICTURES[relativePath] ?? null
}

export function getPostMetaImageUrl(imagePath: string): string
export function getPostMetaImageUrl(imagePath: undefined): undefined
export function getPostMetaImageUrl(imagePath: string | undefined): string | undefined
export function getPostMetaImageUrl(imagePath: string | undefined) {
	if (!imagePath) {
		return imagePath
	}

	const relativePath = toAssetModulePath(imagePath)
	const metadataImageUrl = METADATA_IMAGE_URLS[relativePath]
	if (metadataImageUrl) {
		return metadataImageUrl
	}

	return resolveImageUrl(imagePath)
}
