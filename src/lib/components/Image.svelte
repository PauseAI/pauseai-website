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
			eager: false,
			import: 'default',
			query: {
				enhanced: true
			}
		}
	)

	let picturePromise: Promise<Picture | null> = Promise.resolve(null)

	// Reactive statement to handle the async import when 'src' changes
	$: {
		if (src.startsWith('/')) {
			const fullPath = `../../assets/images${src}`
			if (pictureModules[fullPath]) {
				picturePromise = pictureModules[fullPath]()
			} else {
				picturePromise = Promise.resolve(null)
			}
		} else {
			picturePromise = Promise.resolve(null)
		}
	}
</script>

{#await picturePromise then picture}
	{#if picture}
		<enhanced:img src={picture} {alt} class="enhanced" />
	{:else}
		<img {src} {alt} loading="lazy" />
	{/if}
{/await}

<style>
	.enhanced {
		height: auto;
	}
</style>
