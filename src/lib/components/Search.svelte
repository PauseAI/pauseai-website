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

	let search: HTMLDivElement

	onMount(() => {
		new PagefindUI({
			element: search,
			showSubResults: true,
			showImages: false,
			processResult(result: Result) {
				result.url = result.url.replace(/(.*)\.html/, '$1')
				for (const subResult of result.sub_results) {
					subResult.url = subResult.url.replace(/(.*)\.html(#.*)?/, '$1$2')
				}
			}
		})
		const input = search.querySelector('input') as HTMLInputElement
		input.focus()
	})
</script>

<div class="search" bind:this={search} />

<style>
	:root {
		--pagefind-ui-font: inherit;
		--pagefind-ui-text: var(--text);
		--pagefind-ui-primary: var(--text);
		--pagefind-ui-background: var(--bg-subtle);
		--pagefind-ui-border: var(--brand);
	}

	.search :global(mark) {
		background-color: var(--bg-subtle);
		color: inherit;
	}
</style>
