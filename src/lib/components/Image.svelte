<script lang="ts">
	import type { EnhancedImgAttributes } from '@sveltejs/enhanced-img'

	export let src: string
	export let alt: string

	type Picture = Exclude<EnhancedImgAttributes['src'], string>

	// Use import.meta.glob to statically analyze all potential static assets
	// This creates a map of functions that return promises for each module.
	// The `eager: false` means modules are loaded lazily, and `import: 'default'` gets the default export (e.g., the URL string for images).
	const pictureModules = import.meta.glob<Picture>(
		'../../assets/images/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp,svg}',
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
	<enhanced:img src={picture} {alt} class="enhanced" />
{:else}
	<img {src} {alt} loading="lazy" />
{/if}

<style>
	.enhanced {
		height: auto;
	}
</style>
