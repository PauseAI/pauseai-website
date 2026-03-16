<script lang="ts">
	import type { Picture } from '$lib/types'
	import { SvelteURLSearchParams } from 'svelte/reactivity'

	export let src: string
	export let alt: string | null = null
	export let title: string | null = null
	export let sizes: string | null = null
	let className: string = ''
	export { className as class }

	function normalizeDimension(value?: string) {
		if (!value) return null
		return /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value
	}

	function extractDimensionParams(value: string) {
		const [path, query = ''] = value.split('?')
		const params = new SvelteURLSearchParams(query)
		const width = params.get('width') ?? undefined
		const height = params.get('height') ?? undefined

		console.log({ path, width, height })

		return { width, height, path }
	}

	$: ({ width, height, path } = extractDimensionParams(src))
	$: widthStyle = normalizeDimension(width)
	$: heightStyle = normalizeDimension(height)
	$: enhancedStyle = [
		widthStyle && `width: ${widthStyle};`,
		heightStyle && `height: ${heightStyle};`
	]
		.filter(Boolean)
		.join(' ')

	// Use import.meta.glob to statically analyze all potential static assets
	const pictureModules = import.meta.glob<Picture>(
		'../../assets/images/**/*.{avif,heif,gif,jpeg,jpg,png,tiff,webp}',
		{
			eager: true,
			import: 'default',
			query: {
				enhanced: true
			}
		}
	)
	const assetUrlModules = import.meta.glob<string>('../../assets/images/**/*', {
		eager: true,
		import: 'default',
		query: { url: true }
	})

	let picture: Picture | null = null
	let assetUrl: string | null = null

	$: {
		if (path.startsWith('/')) {
			const fullPath = `../../assets/images${path}`
			if (pictureModules[fullPath]) {
				picture = pictureModules[fullPath]
			} else if (assetUrlModules[fullPath]) {
				assetUrl = assetUrlModules[fullPath]
			}
		}
	}
</script>

{#if picture}
	<enhanced:img
		src={picture}
		{alt}
		class="enhanced {className}"
		loading="lazy"
		{sizes}
		{title}
		style={enhancedStyle || undefined}
	></enhanced:img>
{:else if assetUrl}
	<img src={assetUrl} {alt} {title} loading="lazy" class={className} {width} {height} />
{:else}
	<img src={path} {alt} {title} loading="lazy" class={className} {width} {height} />
{/if}

<style>
	.enhanced {
		height: auto;
	}
</style>
