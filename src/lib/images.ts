const BASE = '../assets/images'

const IMAGE_URLS = import.meta.glob<string>('../assets/images/**.*', {
	eager: true,
	import: 'default',
	query: { url: true }
})

export function getAssetsOrStaticUrl(path: string) {
	const relativePath = BASE + path
	if (IMAGE_URLS[relativePath]) {
		return IMAGE_URLS[relativePath]
	}
	return path
}
