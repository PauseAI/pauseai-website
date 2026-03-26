const BASE = '../assets/images'

const IMAGE_URLS = import.meta.glob<string>('../assets/images/**/*', {
	eager: true,
	import: 'default',
	query: { url: true }
})

const METADATA_IMAGE_URLS = import.meta.glob<string>('../assets/images/**/*', {
	eager: true,
	import: 'default',
	query: {
		url: true,
		w: '1200',
		format: 'jpg',
		quality: '80'
	}
})

function toAssetModulePath(imagePath: string) {
	return BASE + imagePath
}

export function isLocalAssetPath(imagePath: string | undefined): imagePath is string {
	return (
		typeof imagePath === 'string' &&
		imagePath.startsWith('/') &&
		!!IMAGE_URLS[toAssetModulePath(imagePath)]
	)
}

export function resolveImageUrl(imagePath: string) {
	const relativePath = toAssetModulePath(imagePath)
	if (IMAGE_URLS[relativePath]) {
		return IMAGE_URLS[relativePath]
	}
	return imagePath
}

export function getPostMetaImageUrl(imagePath: string): string
export function getPostMetaImageUrl(imagePath: undefined): undefined
export function getPostMetaImageUrl(imagePath: string | undefined) {
	if (!imagePath) {
		return imagePath
	}

	if (isLocalAssetPath(imagePath)) {
		return METADATA_IMAGE_URLS[toAssetModulePath(imagePath)]
	}

	return resolveImageUrl(imagePath)
}
