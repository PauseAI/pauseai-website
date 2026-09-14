<!-- See docs/image-processing.md for the full image-processing architecture. -->
<script lang="ts">
	import type { LoosePicture } from '$lib/types'

	interface Props {
		/** vite-imagetools Picture object (sources + img fallback). */
		picture: LoosePicture
		alt?: string
		title?: string
		sizes?: string
		/** Class applied to the inner <img>. */
		class?: string
		/** Class applied to the <picture> wrapper. */
		pictureClass?: string
		/** Inline style applied to the <picture> wrapper. */
		style?: string
		loading?: 'eager' | 'lazy'
		fetchpriority?: 'high' | 'low' | 'auto'
		decoding?: 'async' | 'sync' | 'auto'
		onerror?: (e: Event) => void
	}

	let {
		picture,
		alt,
		title,
		sizes,
		class: className = '',
		pictureClass = '',
		style = undefined,
		loading = 'lazy',
		fetchpriority = 'auto',
		decoding = 'async',
		onerror = undefined
	}: Props = $props()
</script>

<picture class={pictureClass} {style}>
	{#each Object.entries(picture.sources) as [format, srcset]}
		<source type={`image/${format}`} {srcset} {sizes} />
	{/each}
	<img
		src={picture.img.src}
		width={picture.img.w}
		height={picture.img.h}
		{alt}
		{title}
		{sizes}
		class={className}
		{loading}
		{fetchpriority}
		{decoding}
		{onerror}
	/>
</picture>
