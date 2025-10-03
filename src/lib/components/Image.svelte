<script lang="ts">
	import type { EnhancedImgAttributes } from '@sveltejs/enhanced-img'

	export let src: string
	export let alt: string
	export let sizes: string

	type Picture = Exclude<EnhancedImgAttributes['src'], string>

	// Use import.meta.glob to statically analyze all potential static assets
	const pictureModules = import.meta.glob<Picture>(
		'../../assets/images/*.{avif,heif,gif,jpeg,jpg,png,tiff,webp}',
		{
			eager: true,
			import: 'default',
			query: {
				enhanced: true
			}
		}
	)

	let picture: Picture | null = null

	if (src.startsWith('/')) {
		const fullPath = `../../assets/images${src}`
		if (pictureModules[fullPath]) {
			picture = pictureModules[fullPath]
		}
	}
</script>

{#if picture}
	<enhanced:img src={picture} {alt} class="enhanced" {sizes} />
{:else}
	<img {src} {alt} loading="lazy" />
{/if}

<style>
	.enhanced {
		height: auto;
	}
</style>
