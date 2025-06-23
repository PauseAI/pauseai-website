<script lang="ts">
	import { onMount } from 'svelte'

	// ─── REQUIRED ────────────────────────────────────────────────────────

	/** Tally form ID (required) */
	export let formId: string

	// ─── OPTIONAL ────────────────────────────────────────────────────────

	/** Optional custom domain (Pro feature) */
	export let customDomain = ''

	// Toggle UI features

	export let alignLeft = true
	export let hideTitle = true
	export let transparentBackground = true
	export let dynamicHeight = true

	/** Additional hidden query parameters */
	export let extraParams: Record<string, string | number | boolean> = {}

	/** Initial iframe height in pixels */
	export let height = 282

	// ─── EMBED URL CONSTRUCTION ─────────────────────────────────────────

	$: baseUrl = customDomain
		? `${customDomain.replace(/\/+$/, '')}/${formId}`
		: `https://tally.so/embed/${formId}`

	$: urlParams = new URLSearchParams()

	$: {
		urlParams = new URLSearchParams()

		if (alignLeft) urlParams.set('alignLeft', '1')
		if (hideTitle) urlParams.set('hideTitle', '1')
		if (transparentBackground) urlParams.set('transparentBackground', '1')
		if (dynamicHeight) urlParams.set('dynamicHeight', '1')

		for (const [key, value] of Object.entries(extraParams)) {
			if (value != null && value !== '') {
				urlParams.set(key, value.toString())
			}
		}
	}

	$: formSrc = `${baseUrl}?${urlParams.toString()}`

	// execute after DOM is ready
	onMount(() => {
		const script = document.createElement('script')
		script.src = 'https://tally.so/widgets/embed.js'
		document.body.appendChild(script)
		// Clean up on unmount
		return () => document.body.removeChild(script)
	})
</script>

<div class="tally-form-container">
	<iframe
		data-tally-src={formSrc}
		width="100%"
		{height}
		frameborder="0"
		marginheight="0"
		marginwidth="0"
		title="Tally Form"
		allowfullscreen
		style="width: 100%; height: {height}px; border: 0;"
		sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation"
	></iframe>
</div>

<style>
	.tally-form-container {
		margin: 2rem 0;
		padding: 1.5rem;
		background-color: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
	.tally-form-container iframe {
		border-radius: 4px;
	}
</style>
