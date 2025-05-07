<script lang="ts">
	import {
		locales,
		getLocale,
		localizeHref,
		deLocalizeHref,
		setLocale
	} from '$lib/paraglide/runtime.js'
	import { page } from '$app/stores'
	import Globe from 'lucide-svelte/icons/globe'
	import Navlink from './Navlink.svelte'
	import { building } from '$app/environment'
	import { onMount } from 'svelte'
	import Card from '$lib/components/Card.svelte'

	export let inverted = false

	// Check if we should show the language switcher (only show when multiple locales)
	const showSwitcher = locales.length > 1

	// Display name utilities for multiple locales
	const languageNamesInEnglish = new Intl.DisplayNames('en', { type: 'language' })
	// Keep a map of locale-specific display names
	const nativeLanguageNames: Record<string, Intl.DisplayNames> = {}

	let open = false
	let button: HTMLButtonElement
	let dropdown: HTMLDivElement

	// Get native name for a language
	function getNativeLanguageName(locale: string): string {
		try {
			// Lazily create display names objects
			if (!nativeLanguageNames[locale]) {
				nativeLanguageNames[locale] = new Intl.DisplayNames([locale], { type: 'language' })
			}
			// locales are static => throw if invalid
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			return nativeLanguageNames[locale].of(locale)!
		} catch (e) {
			// Fallback to English name if there's an error
			// locales are static => throw if invalid
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			return languageNamesInEnglish.of(locale)!
		}
	}

	// Get both the current locale's name for a language and its native name
	function getDualLanguageName(locale: string): string {
		const currentLocaleName =
			getLocale() === locale
				? '' // If it's the current locale, don't repeat
				: languageNamesInEnglish.of(locale)
		const nativeName = getNativeLanguageName(locale)

		// If English name and native name are the same (e.g., for English itself in English context)
		// or if we're showing the current locale, just show one name
		if (currentLocaleName === nativeName || currentLocaleName === '') {
			return nativeName
		}

		// Otherwise show both the English name and native name
		return `${currentLocaleName} (${nativeName})`
	}

	// Display the current locale state in UI and console for debugging
	// TODO: disable this once everything is confirmed to work well in production
	function debugLocaleState() {
		// Get current values
		const currentLocale = getLocale()
		const cookieLocale = document.cookie
			.split('; ')
			.find((row) => row.startsWith('PARAGLIDE_LOCALE='))
			?.split('=')[1]
		const pathLocale = window.location.pathname.split('/')[1]
		const isPathLocale = locales.includes(pathLocale as any)

		console.log('🔍 Locale Debug:', {
			getLocale: currentLocale,
			cookieLocale,
			pathLocale: isPathLocale ? pathLocale : null,
			allLocales: locales
		})

		return currentLocale
	}

	onMount(() => {
		// Debug on mount
		debugLocaleState()

		// Only set up event listeners if language switcher is visible
		if (showSwitcher) {
			const clickListener = (event: MouseEvent) => {
				const node = event.target as Node | null
				if (open && !button.contains(node) && !dropdown.contains(node)) {
					open = false
				}
			}
			addEventListener('click', clickListener)
			return () => {
				removeEventListener('click', clickListener)
			}
		}
	})

	function handleLanguageClick(event: MouseEvent) {
		// Get the target element and href
		const target = event.currentTarget as HTMLAnchorElement
		const href = target.href
		const targetLocale = target.getAttribute('hreflang')

		// Debug current state before change
		console.log('🔍 Before click:')
		const currentLocale = debugLocaleState()

		console.log('Language click:', {
			from: currentLocale,
			to: targetLocale,
			href: href
		})

		// Close the dropdown
		open = false

		// Prevent default navigation
		event.preventDefault()

		if (targetLocale === 'auto') {
			document.cookie = 'PARAGLIDE_LOCALE=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
			document.cookie = 'PARAGLIDE_LOCALE=; path=/; max-age=0'
			window.location.href = deLocalizeHref(window.location.pathname)
			return
		}

		// Handle regular locale selection
		if (targetLocale) {
			// explicit reload seems necessary to interact correctly with SvelteKit client-side refresh
			setLocale(targetLocale, { reload: true })
			// As a fallback, manually reload if we're still here after a short delay
			// This handles cases where SvelteKit's client navigation might interfere
			setTimeout(() => {
				console.log('⚠️ Page did not reload automatically, forcing navigation to:', href)
				window.location.href = href
			}, 100)
		}
	}
</script>

{#if showSwitcher}
	<Navlink {inverted} narrow active={open}>
		<button
			class="button reset-button"
			bind:this={button}
			on:click={(e) => {
				e.preventDefault()
				open = !open
			}}
		>
			<Globe size="0.9em" />&nbsp;{getLocale().toUpperCase()}
		</button>
	</Navlink>
{/if}
{#if (open || building) && showSwitcher}
	<div class="dropdown" bind:this={dropdown}>
		<Card>
			<div class="list">
				<!-- Add Auto-detect option at the top -->
				<a
					href={deLocalizeHref($page.url.pathname)}
					hreflang="auto"
					on:click={handleLanguageClick}
					class="auto-detect"
				>
					<span class="auto-icon">🌐</span> <span class="auto-text">AUTO</span>
				</a>

				<!-- Divider -->
				<div class="divider"></div>

				{#each locales as locale}
					{@const href = localizeHref($page.url.pathname, { locale })}
					<a
						{href}
						hreflang={locale}
						aria-current={locale === getLocale() ? 'page' : undefined}
						on:click={handleLanguageClick}
					>
						{getDualLanguageName(locale)}
					</a>
				{/each}
			</div>
		</Card>
	</div>
{/if}

<style>
	a {
		color: unset;
	}
	.button {
		width: 100%;
		cursor: pointer;
		padding: 0 0.5rem;
	}
	.dropdown {
		width: 220px;
		position: absolute;
		top: 100%;
		right: 0;
	}

	.dropdown :global(a) {
		text-decoration: none;
	}

	.list {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		color: var(--text);
		font-family: var(--font-heading);
	}

	a[aria-current='page'] {
		color: var(--brand-subtle);
	}

	.divider {
		height: 1px;
		background: var(--bg);
		margin: 0.25rem 0;
	}

	.auto-detect {
		display: flex;
		align-items: center;
		opacity: 0.8;
	}

	.auto-icon {
		margin-right: 0.5rem;
	}

	.auto-text {
		font-size: 0.9em;
		letter-spacing: 0.05em;
	}

	/* Hide the language switcher but preserve its space in the layout */
	:global(.hidden) {
		visibility: hidden;
		pointer-events: none;
	}
</style>
