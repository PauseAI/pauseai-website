<!-- See docs/image-processing.md for the full image-processing architecture. -->
<script lang="ts">
	import Image from '../images/Image.svelte'
	import { getPostPictures } from './post-pictures-context.svelte'

	interface Props {
		src: string
		alt: string
		title?: string
	}

	let { src, alt, title }: Props = $props()

	// Server-resolved pictures (from +page.server.ts) avoid bundling the
	// import.meta.glob resolver in the client for markdown images. Images
	// not in the map (e.g. external URLs) render via Image's fallbacks.
	let resolved = $derived(getPostPictures()[src])
	let picture = $derived(resolved?.picture ?? null)
	// Use the Vite-resolved asset URL when available; fall back to the raw
	// src (external URLs or unresolved paths).
	let imgSrc = $derived(resolved?.assetUrl ?? src)
</script>

<Image {picture} src={imgSrc} {alt} {title} />
