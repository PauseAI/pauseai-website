<script lang="ts">
	import { onMount } from 'svelte'
	// @ts-expect-error
	import { PagefindUI } from '@pagefind/default-ui'
	import '@pagefind/default-ui/css/ui.css'

	type Result = {
		url: string
		sub_results: {
			url: string
		}[]
	}

	onMount(() => {
		new PagefindUI({
			element: '#search',
			showSubResults: true,
			showImages: false,
			processResult: function (result: Result) {
				result.url = result.url.replace(/(.*)\.html/, '$1')
				for (const subResult of result.sub_results) {
					subResult.url = subResult.url.replace(/(.*).html(#.*)?/, '$1$2')
				}
			}
		})
		const input = document.getElementsByClassName('pagefind-ui__search-input')[0] as HTMLElement
		input.focus()
	})
</script>

<svelte:head>
	<title>Search</title>
</svelte:head>

<div data-pagefind-ignore>
	<h1>Search</h1>

	<div id="search" />
</div>

<style>
	:root {
		--pagefind-ui-font: inherit;
		--pagefind-ui-text: var(--text);
		--pagefind-ui-primary: var(--text);
		--pagefind-ui-background: var(--bg-subtle);
		--pagefind-ui-border: var(--brand);
	}

	#search :global(mark) {
		background-color: var(--bg-subtle);
		color: var(--text);
	}
</style>
