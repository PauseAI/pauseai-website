<script lang="ts">
	export let src: string
	export let alt: string

	// Use import.meta.glob to statically analyze all potential static assets
	// This creates a map of functions that return promises for each module.
	// The `eager: false` means modules are loaded lazily, and `import: 'default'` gets the default export (e.g., the URL string for images).
	const staticAssetModules = import.meta.glob<string>(
		'../../../../static/**/*.(png|jpg|jpeg|gif|svg|webp)',
		{ eager: false, import: 'default' }
	)

	let staticSrcPromise: Promise<string | null> = Promise.resolve(null)

	// Reactive statement to handle the async import when 'src' changes
	$: {
		if (src.startsWith('/')) {
			const fullPath = `../../../../static${src}`
			if (staticAssetModules[fullPath]) {
				staticSrcPromise = staticAssetModules[fullPath]()
			} else {
				console.warn(`Static asset not found or not matched by glob: ${fullPath}`)
				staticSrcPromise = Promise.resolve(null)
			}
		} else {
			staticSrcPromise = Promise.resolve(null)
		}
	}
</script>

{#await staticSrcPromise then staticSrc}
	{#if staticSrc}
		<enhanced:img src={staticSrc} {alt} />
	{:else}
		<img {src} {alt} />
	{/if}
{/await}
