<script lang="ts">
	import { onMount } from 'svelte'
	// @ts-expect-error -- The package doesn't provide types.
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

		const container = document.getElementById('search')!
		const input = container.getElementsByClassName(
			'pagefind-ui__search-input'
		)[0] as HTMLInputElement
		input.focus()

		// Pagefind highlights matches in excerpts but not in result titles.
		// Re-runs after every DOM update to inject <mark> tags into title links.
		const observer = new MutationObserver(() => {
			const query = input.value.trim()
			if (!query) return
			const terms = query.split(/\s+/).sort((a, b) => b.length - a.length)
			if (!terms.length) return
			const termPattern = terms
				.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\w*')
				.join('|')
			const regex = new RegExp(`\\b(${termPattern})`, 'gi')
			for (const link of container.querySelectorAll<HTMLAnchorElement>(
				'.pagefind-ui__result-link'
			)) {
				const text = link.textContent ?? ''
				const highlighted = text
					.split(regex)
					.map((part, i) => {
						const escaped = part.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
						return i % 2 === 1 ? `<mark>${escaped}</mark>` : escaped
					})
					.join('')
				if (link.innerHTML !== highlighted) link.innerHTML = highlighted
			}
		})

		observer.observe(container, { childList: true, subtree: true })

		return () => observer.disconnect()
	})
</script>

<div id="search" />

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
