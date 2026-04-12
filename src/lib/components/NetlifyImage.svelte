<script lang="ts">
	import { SvelteURLSearchParams } from 'svelte/reactivity'

	export let src: string
	export let alt: string
	export let widths: number[] = [400, 800, 1200, 1600, 2400]
	export let sizes: string = '(min-width: 1280px) 1200px, 100vw'
	export let quality: number = 80
	export let fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside' = 'contain'

	export let pictureClass: string | undefined = undefined
	export let imgClass: string | undefined = undefined
	export let style: string | undefined = undefined
	export let loading: 'lazy' | 'eager' = 'lazy'
	export let decoding: 'async' | 'sync' | 'auto' = 'async'

	/** Callback when the image fails to load entirely (including fallback) */
	export let onFailed: (() => void) | undefined = undefined

	let useFallback = false

	function handleError(e: Event) {
		const imgElement = e.target as HTMLImageElement
		// If we haven't used the fallback yet, try it
		if (!useFallback && imgElement.src !== src) {
			useFallback = true
			console.warn(`NetlifyImage: Failed to load optimized image ${src}, trying fallback`)
		} else {
			// Both optimized and fallback failed, or we hit an error on the fallback itself
			console.warn(`NetlifyImage: Failed to load image ${src} entirely`)
			onFailed?.()
		}
	}

	function buildNetlifyUrl(
		path: string,
		options: {
			w?: number
			q?: number
			fm?: string
			fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
		}
	) {
		const params = new SvelteURLSearchParams()
		params.set('url', path)
		if (options.w) params.set('w', `${options.w}`)
		if (options.q) params.set('q', `${options.q}`)
		if (options.fm) params.set('fm', options.fm)
		if (options.fit) params.set('fit', options.fit)
		return `/.netlify/images?${params.toString()}`
	}

	function buildSrcSet(format: string) {
		return widths
			.map(
				(width) => `${buildNetlifyUrl(src, { w: width, q: quality, fm: format, fit })} ${width}w`
			)
			.join(', ')
	}

	const avifSrcSet = buildSrcSet('avif')
	const webpSrcSet = buildSrcSet('webp')

	// Fallback to a jpeg
	const fallbackSrc = buildNetlifyUrl(src, {
		w: widths[0], // Smallest width for browsers that don't support srcset
		q: quality,
		fm: 'jpg',
		fit
	})
</script>

{#if useFallback}
	<img on:error={handleError} {src} {alt} class={imgClass} {style} {loading} {decoding} />
{:else}
	<picture class={pictureClass} {style}>
		<source type="image/avif" srcset={avifSrcSet} {sizes} />
		<source type="image/webp" srcset={webpSrcSet} {sizes} />
		<img
			on:error={handleError}
			src={fallbackSrc}
			{alt}
			{sizes}
			class={imgClass}
			{loading}
			{decoding}
			width={widths[widths.length - 1]}
		/>
	</picture>
{/if}
