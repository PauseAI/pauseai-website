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

	const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

	const escapeHtml = (value: string) =>
		value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

	const unicodeWordCharClass = '\\p{L}\\p{N}\\p{M}_'

	const buildHighlightRegex = (terms: string[]) => {
		// This uses a Unicode-aware approximation of Pagefind's title matching, but may
		// not exactly match Pagefind's own normalization behavior for every locale or query.
		const termPattern = terms
			.map((term) => `${escapeRegExp(term)}[${unicodeWordCharClass}]*`)
			.join('|')

		return new RegExp(`(^|[^${unicodeWordCharClass}])(${termPattern})`, 'giu')
	}

	const highlightTitle = (text: string, regex: RegExp) => {
		regex.lastIndex = 0
		let highlighted = ''
		let lastIndex = 0

		for (const match of text.matchAll(regex)) {
			const prefix = match[1] ?? ''
			const matchedTerm = match[2]
			const matchIndex = match.index ?? 0
			const termIndex = matchIndex + prefix.length

			highlighted += escapeHtml(text.slice(lastIndex, matchIndex))
			highlighted += escapeHtml(prefix)
			highlighted += `<mark>${escapeHtml(matchedTerm)}</mark>`
			lastIndex = termIndex + matchedTerm.length
		}

		return highlighted + escapeHtml(text.slice(lastIndex))
	}

	onMount(() => {
		new PagefindUI({
			element: '#search',
			showSubResults: true,
			showImages: false,
			processResult: function (result: Result) {
				result.url = result.url.replace(/(.*)\.html/, '$1')
				for (const subResult of result.sub_results) {
					subResult.url = subResult.url.replace(/(.*)\.html(#.*)?/, '$1$2')
				}
			}
		})

		const container = document.getElementById('search')!
		const input = container.getElementsByClassName(
			'pagefind-ui__search-input'
		)[0] as HTMLInputElement
		input.focus()

		// Pagefind highlights matches in excerpts but not in result titles.
		// Re-runs on query changes and after Pagefind updates the results DOM.
		const updateTitleHighlights = () => {
			const query = input.value.trim()
			const terms = query.split(/\s+/).filter(Boolean)
			const regex = terms.length ? buildHighlightRegex(terms) : null
			for (const link of container.querySelectorAll<HTMLAnchorElement>(
				'.pagefind-ui__result-link'
			)) {
				const text = link.textContent ?? ''
				if (!regex) {
					const plainText = escapeHtml(text)
					if (link.innerHTML !== plainText) link.innerHTML = plainText
					continue
				}

				const highlighted = highlightTitle(text, regex)
				if (link.innerHTML !== highlighted) link.innerHTML = highlighted
			}
		}

		const observer = new MutationObserver(updateTitleHighlights)
		input.addEventListener('input', updateTitleHighlights)

		observer.observe(container, { childList: true, subtree: true })

		return () => {
			observer.disconnect()
			input.removeEventListener('input', updateTitleHighlights)
		}
	})
</script>

<div id="search"></div>

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
