<!-- See docs/image-processing.md for the full image-processing architecture. -->
<script lang="ts">
	import Picture from './Picture.svelte'
	import type { LoosePicture } from '$lib/types'
	import { layoutWidth } from '$lib/config'

	interface Props {
		picture?: LoosePicture | null
		/** Fallback <img> src when no picture is available (external URL or Vite-resolved asset URL). */
		src?: string
		alt?: string
		title?: string
		sizes?: string
		aspectRatio?: number
		class?: string
		loading?: 'eager' | 'lazy'
		fetchpriority?: 'high' | 'low' | 'auto'
	}

	let {
		picture,
		src,
		alt,
		title,
		sizes,
		aspectRatio,
		class: className = '',
		loading = 'lazy',
		fetchpriority = 'auto'
	}: Props = $props()

	// When using object-fit: cover with a target aspect ratio, the image is scaled
	// to cover the container, so the effective source width may exceed the display
	// width. The scaling factor is max(1, imgAr / targetAr).
	let coverFactor = $derived.by(() => {
		if (!picture || !aspectRatio || !picture.img.w || !picture.img.h) return 1
		const imgAr = picture.img.w / picture.img.h
		return Math.max(1, imgAr / aspectRatio)
	})

	// Apply the cover factor to each length in the sizes string. Entries with
	// media conditions get their length wrapped in calc(); bare lengths too.
	function scaleSizes(sizesStr: string, factor: number): string {
		if (factor === 1) return sizesStr
		return sizesStr
			.split(/,(?![^()]*\))/)
			.map((entry) => entry.trim())
			.map((entry) => {
				const match = entry.match(/^(\([^)]*\))\s+(.+)$/)
				return match ? `${match[1]} calc(${match[2]} * ${factor})` : `calc(${entry} * ${factor})`
			})
			.join(', ')
	}

	let effectiveSizes = $derived.by(() => {
		if (sizes) return scaleSizes(sizes, coverFactor)
		return `calc(min(${layoutWidth}, 100vw) * ${coverFactor})`
	})
</script>

{#if picture}
	<Picture
		{picture}
		{alt}
		{title}
		class={className}
		{loading}
		{fetchpriority}
		sizes={effectiveSizes}
		imgStyle="height: auto"
	/>
{:else}
	<img {src} {alt} {title} {loading} {fetchpriority} class={className} style="height: auto" />
{/if}
