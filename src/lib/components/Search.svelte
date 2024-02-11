<script>
	import { onMount } from 'svelte'
	// @ts-expect-error
	import { PagefindUI } from '@pagefind/default-ui'
	import '@pagefind/default-ui/css/ui.css'

	onMount(() => {
		console.log('loaded')
		new PagefindUI({
			element: '#search',
			showSubResults: true,
			showImages: false,
			bundlePath: '/_pagefind/'
		})
	})
</script>

<div id="search" />

<style>
	:root {
		--pagefind-ui-font: inherit;
		--pagefind-ui-text: var(--text);
		--pagefind-ui-primary: inherit;
		--pagefind-ui-background: var(--bg-subtle);
		--pagefind-ui-border: var(--brand);
	}
</style>
