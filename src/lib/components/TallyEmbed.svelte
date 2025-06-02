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

	onMount(() => {
		const script = document.createElement('script')
		script.src = 'https://tally.so/widgets/embed.js'
		document.body.appendChild(script)
	})
</script>

<iframe
	data-tally-src={formSrc}
	src={formSrc}
	width="100%"
	{height}
	frameborder="0"
	marginheight="0"
	marginwidth="0"
	allowfullscreen
	style="width: 100%; height: {height}px; border: 0;"
	sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation"
></iframe>
