<script lang="ts">
	import {
		locales,
		getLocale,
		localizeHref,
		deLocalizeHref,
		setLocale,
		type Locale
	} from '$lib/paraglide/runtime.js'
	import { page } from '$app/stores'
	import Globe from 'lucide-svelte/icons/globe'
	import Navlink from './Navlink.svelte'
	import { building } from '$app/environment'
	import { onMount } from 'svelte'
	import Card from '$lib/components/Card.svelte'
	import Cookies from 'js-cookie'

	export let inverted = false

	// Check if we should show the language switcher (only show when multiple locales)
	const showSwitcher = locales.length > 1

	// Flag to track if locale was changed externally
	let externalLocaleChange = false

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

	// Check if cookie was changed externally (and update shadow cookie which tracks this)
	function checkLocaleChange(): boolean {
		if (typeof window === 'undefined') return false

		const cookieLocale = Cookies.get('PARAGLIDE_LOCALE')
		const shadowLocale = Cookies.get('PARAGLIDE_LOCALE_SHADOW')

		// Check for change - treat undefined shadow cookie as a change too
		// (This catches first-time visits where shadow cookie isn't set yet)
		const wasChanged = shadowLocale !== cookieLocale

		// Always update the shadow cookie to match the current value
		if (cookieLocale) {
			Cookies.set('PARAGLIDE_LOCALE_SHADOW', cookieLocale, { path: '/' })
		} else {
			Cookies.remove('PARAGLIDE_LOCALE_SHADOW', { path: '/' })
		}

		return wasChanged
	}

	onMount(() => {
		if (typeof window === 'undefined') return

		if (checkLocaleChange()) {
			// Add visual indication
			console.log('🌐 Locale was changed externally!')
			if (button) button.classList.add('locale-changed')
		}

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
		const targetLocale = target.getAttribute('hreflang') as Locale | 'auto'

		// Close the dropdown
		open = false

		// Prevent default navigation
		event.preventDefault()

		if (targetLocale === 'auto') {
			// Remove both cookies for auto-detect
			Cookies.remove('PARAGLIDE_LOCALE', { path: '/' })
			Cookies.remove('PARAGLIDE_LOCALE_SHADOW', { path: '/' })
			window.location.href = deLocalizeHref(window.location.pathname)
			return
		}

		// Handle regular locale selection
		if (targetLocale) {
			// Update shadow cookie to prevent detection as an external change
			Cookies.set('PARAGLIDE_LOCALE_SHADOW', targetLocale, { path: '/' })
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
				button.classList.remove('locale-changed') // user has attended
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

	/* Visual indicator for locale change */
	:global(.locale-changed) {
		animation: pulse 2s infinite;
		transform-origin: center;
	}

	@keyframes pulse {
		0% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.6;
			transform: scale(1.2);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
