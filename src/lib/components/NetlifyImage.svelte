<script lang="ts">
	export let src: string
	export let alt: string
	export let widths: number[] = [400, 800, 1200, 1600, 2400]
	export let sizes: string = '(min-width: 1280px) 1200px, 100vw'
	export let quality: number = 80
	export let fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside' = 'cover'

	export let pictureClass: string | undefined = undefined
	export let imgClass: string | undefined = undefined
	export let style: string | undefined = undefined
	export let loading: 'lazy' | 'eager' = 'lazy'
	export let decoding: 'async' | 'sync' | 'auto' = 'async'

	function buildNetlifyUrl(
		path: string,
		options: {
			w?: number
			q?: number
			fm?: string
			fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
		}
	) {
		const params = new URLSearchParams()
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

<picture class={pictureClass} {style}>
	<source type="image/avif" srcset={avifSrcSet} {sizes} />
	<source type="image/webp" srcset={webpSrcSet} {sizes} />
	<img
		src={fallbackSrc}
		{alt}
		{sizes}
		class={imgClass}
		{loading}
		{decoding}
		width={widths[widths.length - 1]}
	/>
</picture>
