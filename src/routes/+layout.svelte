<script lang="ts">
	import type { GeoApiResponse } from '$api/geo/+server'
	import { browser } from '$app/environment'
	import { page } from '$app/state'
	import Banner from '$lib/components/Banner.svelte'
	import Hero from '$lib/components/Hero.svelte'
	import Link from '$lib/components/Link.svelte'
	import NearbyEvent from '$lib/components/NearbyEvent.svelte'
	import PreloadFonts from '$lib/components/PreloadFonts.svelte'
	import SearchModal from '$lib/components/SearchModal.svelte'
	import Toc from '$lib/components/Toc.svelte'
	import { searchOpen } from '$lib/stores/searchModal'
	import { deLocalizeHref } from '$lib/paraglide/runtime'
	import '@fontsource/roboto-slab/300.css'
	import '@fontsource/roboto-slab/500.css'
	import '@fontsource/roboto-slab/700.css'
	import robotoSlabLatin300 from '@fontsource/roboto-slab/files/roboto-slab-latin-300-normal.woff2'
	import '@fontsource/saira-condensed/700.css'
	import sairaCondensedLatin700 from '@fontsource/saira-condensed/files/saira-condensed-latin-700-normal.woff2'
	import { ProgressBar } from '@prgm/sveltekit-progress-bar'
	import { Cookie, SetCookie } from '@remix-run/headers'
	import { onMount } from 'svelte'
	import { Toaster } from 'svelte-french-toast'
	import '../styles/print.css'
	import '../styles/styles.css'
	import Footer from './footer.svelte'
	import Header from './header.svelte'
	import PageTransition from './transition.svelte'
	import bannerSelection from './banner-selection.js?raw'
	import themeSelection from './theme-selection.js?raw'
	import hydrationAwareClick from './hydration-aware-click.js?raw'
	import type { PageData } from './$types'

	interface Props {
		data: PageData
		children?: import('svelte').Snippet
	}

	let { data, children }: Props = $props()

	let eventFound: boolean = $state(false)
	let geoForNearbyEvent: GeoApiResponse | null = $state(null)
	let hero = $derived(deLocalizeHref(page.url.pathname) === '/')
	let embed = $derived(page.route.id?.startsWith('/embed/') ?? false)

	onMount(async () => {
		document.documentElement.removeAttribute('data-waiting')

		const searchString = window.location.search
		const response = await fetch('/api/geo' + searchString)
		if (!response.ok) return
		const geo = (await response.json()) as GeoApiResponse

		// Keep geo cookie in sync with actual location.
		// Re-run selectBanners if country changed or cookie not yet set.
		const geoCountryCookie = new Cookie(document.cookie).get('geo_country')

		// geo.country is an object { code: 'US' } from Netlify, SetCookie needs a string
		const countryString = (
			typeof geo?.country === 'object' ? geo?.country?.code : geo?.country
		) as string

		if (countryString && countryString !== geoCountryCookie) {
			document.cookie = new SetCookie({
				name: 'geo_country',
				value: countryString,
				path: '/',
				maxAge: 31536000,
				sameSite: 'Lax'
			}).toString() // 1 year
			window.selectBanners()
		}

		// Don't show NearbyEvent if a geo banner is active (geo banners take priority)
		if (!document.documentElement.dataset.isActiveBannerGeo) {
			geoForNearbyEvent = geo
		}
	})

	// NearbyEvent overrides the main banner
	$effect(() => {
		if (browser && eventFound) {
			delete document.documentElement.dataset.activeBanner
		}
	})

	function sanitizeScript(code: string) {
		return code
			.replaceAll(/\/\*[\s\S]*?\*\//g, '') // remove block comments
			.replaceAll(/\/\/[^"'`\n]*?$/gm, '') // remove line comments
			.replaceAll(/\n\s*(?=\n)/g, '') // remove empty lines
	}
</script>

<svelte:head>
	<script>
		var mainBannerRules = [
			{
				id: 'gb-feb28-protest',
				countries: ['GB'],
				dateRange: [null, '2025-02-28']
			},
			{
				id: 'us-state-sovereignty',
				countries: ['US'],
				dateRange: [null, '2025-02-28']
			},
			{
				id: 'holiday-littlehelpers',
				countries: null,
				dateRange: [null, '2024-12-31']
			}
		]

		var campaignBannerRules = [
			{
				id: 'brussels-ep-protest-2026',
				dateRange: [null, '2026-02-23']
			}
		]
	</script>

	<!-- eslint-disable-next-line svelte/no-at-html-tags not vulnerable against XSS -->
	{@html `<${'script'}>${sanitizeScript(themeSelection)}</script>`}

	<!-- eslint-disable-next-line svelte/no-at-html-tags not vulnerable against XSS -->
	{@html `<${'script'}>${sanitizeScript(hydrationAwareClick)}</script>`}

	<!-- eslint-disable-next-line svelte/no-at-html-tags not vulnerable against XSS -->
	{@html `<${'script'}>${sanitizeScript(bannerSelection)}</script>`}
</svelte:head>

<PreloadFonts urls={[robotoSlabLatin300, sairaCondensedLatin700]} />

<h2 style="width: 0; height: 0; margin: 0; padding: 0; visibility: hidden;" data-pagefind-ignore>
	Top
</h2>

{#if !embed}
	<div class="page-top" class:hero-page={hero}>
		<!-- Dev-only locale mismatch warning. No id when isDev, so not affected by banner orchestration CSS. -->
		{#if data.localeAlert}
			<Banner
				contrast={data.localeAlert.isDev}
				id={data.localeAlert.isDev ? undefined : 'locale-switch'}
			>
				<!-- eslint-disable-next-line svelte/no-at-html-tags not vulnerable against XSS -->
				{@html data.localeAlert.message}
			</Banner>
		{/if}

		<!-- All banners rendered, hidden by default. Blocking script reveals the active main/campaign banner. -->
		<Banner contrast={hero} id="gb-feb28-protest">
			<b
				>PauseAI's largest ever protest will be on Saturday February 28th in London. <Link
					href="https://luma.com/o0p4htmk">Sign up now!</Link
				></b
			>
		</Banner>
		<Banner contrast={hero} id="us-state-sovereignty">
			<b
				>HELP US PROTECT STATE SOVEREIGNTY ON AI REGULATION | <Link
					href="https://mstr.app/b09fa92b-1899-43a0-9d95-99cd99c9dfb2">ACT NOW »</Link
				></b
			>
		</Banner>
		<Banner contrast={hero} id="holiday-littlehelpers" href="/littlehelpers">
			<strong>🎄 Holiday Matching Campaign!</strong> Help fund volunteer stipends for PauseAI
			advocates. <Link href="/littlehelpers">Join the Little Helpers campaign →</Link>
		</Banner>

		<NearbyEvent contrast={hero} bind:eventFound geo={geoForNearbyEvent} />

		<Banner type="campaign" href="/brussels-ep-protest-2026" id="brussels-ep-protest-2026">
			<strong>Brussels, Feb 23</strong> - Join us outside the European Parliament to call for a global
			treaty to pause frontier AI development.
		</Banner>

		{#if hero}
			<div class="hero-section">
				<div class="menu-band">
					<Header inverted />
				</div>
				<Hero />
			</div>
		{/if}
	</div>
{/if}

<div class="layout" class:hero-page={hero} class:embed>
	{#if page.route.id === '/sayno'}
		<!-- Dynamic import and render the selfie UX component -->
		{#await import('./sayno/SelfieUX.svelte') then module}
			<module.default />
		{/await}
	{/if}

	{#if !hero && !embed}
		<Header />
	{/if}

	<main>
		<PageTransition url={page.url.pathname}>
			{@render children?.()}
		</PageTransition>
	</main>

	{#if !embed}
		<Footer />
	{/if}
</div>

{#if !embed}
	<SearchModal bind:open={$searchOpen} />

	<Toaster
		toastOptions={{
			style: 'background-color: var(--bg-subtle); color: var(--text)',
			iconTheme: {
				primary: 'var(--brand)',
				secondary: 'white'
			}
		}}
	/>

	{#if !['/', '/communities', '/outcomes', '/pdoom', '/quotes', '/dear-sir-demis-2025'].includes(deLocalizeHref(page.url.pathname))}
		<Toc />
	{/if}

	<ProgressBar color="var(--brand)" />
{/if}

<style>
	/* Hide all orchestrated banners by default.
	   Each Banner/CampaignBanner self-registers its reveal rule via <svelte:head>. */
	:global([data-banner-id]),
	:global([data-campaign-banner-id]) {
		display: none !important;
	}

	:global(:root) {
		--gutter-max: 3rem;
		--gutter-min: 0.5rem;
		--page-gutter: var(--gutter-max);
	}

	/* Linearly interpolate from gutter-max (at 600px) down to gutter-min */
	@media (max-width: 600px) {
		:global(:root) {
			--page-gutter: clamp(
				var(--gutter-min),
				calc(var(--gutter-min) + (100% - 600px + 2 * (var(--gutter-max) - var(--gutter-min))) / 2),
				var(--gutter-max)
			);
		}
	}

	.page-top.hero-page {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
	}

	.page-top.hero-page > :global(.banner) {
		flex-shrink: 0;
	}

	.page-top.hero-page .hero-section {
		flex: 1;
		min-height: var(--hero-min-height);
		display: flex;
		flex-direction: column;
	}

	/* Orange band behind the menu. The nav sits in normal document flow, so the
	   band is exactly as tall as the menu content. */
	.menu-band {
		background-color: var(--hero-orange);
		/* Paint above the .hero sibling so the language-switcher dropdown,
		   which opens downward past the band, isn't covered by it. */
		position: relative;
		z-index: 1;
	}

	.menu-band :global(nav) {
		width: min(var(--page-width), 100% - 2 * var(--page-gutter));
		margin-inline: auto;
		/* Tighter vertical padding than the component's responsive default. */
		--vspace: 1.85rem;
	}

	.layout {
		height: 100%;
		position: relative;
		max-inline-size: var(--page-width);
		display: grid;
		grid-template-rows: auto 1fr auto;
		grid-auto-columns: 100%;
		margin-inline: auto;
		padding: 0 var(--page-gutter);
	}

	.layout.hero-page {
		grid-template-rows: 1fr auto;
	}

	.layout.embed {
		grid-template-rows: 1fr;
		padding: 0;
		max-inline-size: none;
	}

	.layout.embed main {
		padding-block: 0;
		margin-bottom: 0;
	}

	main {
		padding-block: 1rem;
		margin-bottom: 5rem;
	}

	@media (max-width: 600px) {
		main {
			margin-bottom: 2rem;
		}
	}

	/* @media (min-width: --page-width) {
		.layout {
			padding: 0;
		}
	} */
</style>
