// See docs/image-processing.md for the full image-processing architecture.
import { getPostMetaImageUrl, resolveImageUrl, resolvePicture } from '$lib/image.server'
import type { ResolvedImage } from '$lib/post-pictures-context.svelte'
import { importMarkdown } from './markdown'

export interface PostImages {
	/** Server-resolved banner image (frontmatter `image`), or null if absent. */
	banner: ResolvedImage | null
	/** Meta image URL for social/SEO tags. */
	metaImageUrl: string | undefined
	/** Server-resolved body images keyed by their original src path. */
	pictures: Record<string, ResolvedImage>
}

/**
 * Resolves the frontmatter banner image and all collected body images
 * server-side so the import.meta.glob resolver stays out of the client
 * bundle. The client load re-imports the same module to render content.
 */
export async function imagesForPost(locale: string, slug: string): Promise<PostImages> {
	let pictures: Record<string, ResolvedImage> = {}
	let banner: ResolvedImage | null = null
	let metaImageUrl: string | undefined

	try {
		const { metadata } = await importMarkdown(locale, slug)

		// Banner image from frontmatter
		if (metadata.image) {
			metaImageUrl = getPostMetaImageUrl(metadata.image)
			banner = resolveBanner(metadata.image)
		}

		// Body images collected by remark-collect-images
		pictures = resolveBodyPictures(metadata._images)
	} catch {
		// If the markdown can't be imported (e.g. missing translation in prod),
		// the client load will surface the 404 — no pictures to resolve here.
	}

	return { pictures, banner, metaImageUrl }
}

function resolveBanner(image: string): ResolvedImage {
	if (image.startsWith('/')) {
		return {
			picture: resolvePicture(image),
			assetUrl: resolveImageUrl(image)
		}
	}
	return { picture: null, assetUrl: null }
}

function resolveBodyPictures(images: string[] | undefined): Record<string, ResolvedImage> {
	if (!images || images.length === 0) return {}
	const pictures: Record<string, ResolvedImage> = {}
	for (const src of images) {
		if (src.startsWith('/')) {
			pictures[src] = {
				picture: resolvePicture(src),
				assetUrl: resolveImageUrl(src)
			}
		} else {
			pictures[src] = { picture: null, assetUrl: null }
		}
	}
	return pictures
}
