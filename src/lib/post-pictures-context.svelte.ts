// See docs/image-processing.md for the full image-processing architecture.
import { getContext, setContext } from 'svelte'
import type { Picture } from '$lib/types'

const KEY = 'pauseai:post-pictures'

export type ResolvedImage = {
	/** Server-resolved enhanced-image Picture object, or null for non-asset URLs. */
	picture: Picture | null
	/** Vite-resolved asset URL, or null if `src` is not a bundled asset. */
	assetUrl: string | null
}

export type PictureMap = Record<string, ResolvedImage>

/** Sets the post's server-resolved picture map into context for markdown <img> rendering. */
export function setPostPictures(map: PictureMap) {
	setContext(KEY, map)
}

/** Returns the post's picture map, or an empty object if none was set. */
export function getPostPictures(): PictureMap {
	return getContext<PictureMap>(KEY) ?? {}
}
