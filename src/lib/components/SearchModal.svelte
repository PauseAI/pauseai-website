<script lang="ts">
	import { browser } from '$app/environment'
	import { onNavigate } from '$app/navigation'
	import type { PagefindModal, PagefindSearchResult } from '@pagefind/component-ui'
	import { onMount } from 'svelte'
	import { searchOpen } from '$lib/stores/searchModal'

	interface Props {
		open?: boolean
	}

	let { open = $bindable(false) }: Props = $props()

	let theme: 'light' | 'dark' = $state('light')
	let modalEl: PagefindModal | null = $state(null)
	let ready = $state(false)

	$effect(() => {
		if (browser && open && modalEl && ready) {
			modalEl.open()
			open = false
		}
	})

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

		// Open the search modal when "/" is pressed.
		const handleKeydown = (event: KeyboardEvent) => {
			// Ignore when the modal is open (it has its own keyboard handling)
			if ($searchOpen) return

			// Ignore when the user is typing in a field, editing text, or using modifiers
			const target = event.target as HTMLElement | null
			if (
				target?.isContentEditable ||
				target instanceof HTMLInputElement ||
				target instanceof HTMLTextAreaElement ||
				target instanceof HTMLSelectElement
			) {
				return
			}

			// event.key is the produced character, so "/" works across keyboard layouts
			if (event.key === '/') {
				event.preventDefault()
				searchOpen.set(true)
			}
		}

		window.addEventListener('keydown', handleKeydown)

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
			window.removeEventListener('keydown', handleKeydown)
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
