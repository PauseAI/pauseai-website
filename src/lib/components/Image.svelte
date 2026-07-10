<script lang="ts">
	import type { Picture } from '$lib/types'
	import { layoutWidth } from '$lib/config'

	interface Props {
		src: string
		alt?: string
		title?: string
		sizes?: string
		aspectRatio?: number
		class?: string
		loading?: 'eager' | 'lazy'
		fetchpriority?: 'high' | 'low' | 'auto'
	}

	let {
		src,
		alt,
		title,
		sizes,
		aspectRatio,
		class: className = '',
		loading = 'lazy',
		fetchpriority = 'auto'
	}: Props = $props()

	// Use import.meta.glob to statically analyze all potential static assets
	const pictureModules = import.meta.glob<Picture>(
		'../../assets/images/**/*.{avif,heif,gif,jpeg,jpg,png,tiff,webp}',
		{
			eager: true,
			import: 'default',
			query: {
				enhanced: true,
				w: '520;640;800;1280;1920;2560;3840'
			}
		}
	)
	const assetUrlModules = import.meta.glob<string>('../../assets/images/**/*', {
		eager: true,
		import: 'default',
		query: { url: true }
	})

	let fullPath = $derived(src.startsWith('/') ? `../../assets/images${src}` : null)
	let picture: Picture | null = $derived(pictureModules[fullPath ?? ''] ?? null)
	let assetUrl: string | null = $derived(assetUrlModules[fullPath ?? ''] ?? null)

	// When using object-fit: cover with a target aspect ratio, the image is scaled
	// to cover the container, so the effective source width may exceed the display
	// width. The scaling factor is max(1, imgAr / targetAr).
	let coverFactor = $derived.by(() => {
		if (!picture || !aspectRatio) return 1
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
	<enhanced:img
		src={picture}
		{alt}
		class="enhanced {className}"
		{loading}
		{fetchpriority}
		sizes={effectiveSizes}
		{title}
	></enhanced:img>
{:else if assetUrl}
	<img src={assetUrl} {alt} {title} {loading} {fetchpriority} class={className} />
{:else}
	<img {src} {alt} {title} {loading} {fetchpriority} class={className} />
{/if}

<style>
	.enhanced {
		height: auto;
	}
</style>
