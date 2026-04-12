<script lang="ts">
	import { browser } from '$app/environment'
	import { onNavigate } from '$app/navigation'
	import type { PagefindModal, PagefindSearchResult } from '@pagefind/component-ui'
	import { onMount } from 'svelte'

	export let open = false

	let theme: 'light' | 'dark' = 'light'
	let modalEl: PagefindModal | null = null
	let ready = false

	$: if (browser && open && modalEl && ready) {
		modalEl.open()
		open = false
	}

	onMount(() => {
		const init = async () => {
			const { configureInstance } = await import('@pagefind/component-ui')

			// Configure the Pagefind instance manually to support URL transformation
			const instance = configureInstance('default', {
				bundlePath: '/pagefind/'
			})

			// Intercept search results and transform URLs before they are rendered
			instance.on('results', (searchResults) => {
				const searchResultsTyped = searchResults as PagefindSearchResult
				searchResultsTyped.results.forEach((result) => {
					const originalData = result.data
					result.data = async () => {
						const data = await originalData()

						const cleanUrl = (url: string) =>
							url.replace(/\/index\.html(?=#|$)/, '/').replace(/\.html(?=#|$)/, '')

						data.url = cleanUrl(data.url)

						for (const subResult of data.sub_results || []) {
							subResult.url = cleanUrl(subResult.url)
						}

						return data
					}
				})
			})

			// Import the component UI and its CSS dynamically to ensure SSR compatibility
			await import('@pagefind/component-ui')
			// @ts-expect-error -- The package doesn't provide types for the CSS.
			await import('@pagefind/component-ui/css')

			if (modalEl) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- Can't resolve PagefindModal
				modalEl.register(instance)
			}
			ready = true
		}
		void init()

		// Theme synchronization logic for Pagefind's built-in dark mode
		const setPagefindTheme = () => {
			const currentTheme =
				(document.documentElement.getAttribute('color-scheme') as 'light' | 'dark') || 'light'
			theme = currentTheme

			// Component UI specifically looks for data-pf-theme for its built-in styling
			document.documentElement.setAttribute('data-pf-theme', currentTheme)
		}

		const observer = new MutationObserver(setPagefindTheme)
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['color-scheme']
		})

		setPagefindTheme()

		return () => {
			observer.disconnect()
		}
	})

	onNavigate(() => {
		if (modalEl) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- Can't resolve PagefindModal
			modalEl.close()
		}
	})
</script>

{#if browser}
	<pagefind-modal bind:this={modalEl} reset-on-close data-pf-theme={theme}></pagefind-modal>
{/if}

<style>
	/* Minimal styling shared between modal and trigger if needed */
	pagefind-modal {
		--pf-font: var(--font-body);
		--pf-outline-focus: var(--brand);
	}
</style>
