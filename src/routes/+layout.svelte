<script lang="ts">
	import { browser } from '$app/environment'
	import type { GeoApiResponse } from '$api/geo/+server'
	import { page } from '$app/stores'
	import Banner from '$lib/components/Banner.svelte'
	import CampaignBanner from '$lib/components/CampaignBanner.svelte'
	import Hero from '$lib/components/Hero.svelte'
	import Link from '$lib/components/Link.svelte'
	import NearbyEvent from '$lib/components/NearbyEvent.svelte'
	import PreloadFonts from '$lib/components/PreloadFonts.svelte'
	import Toc from '$lib/components/Toc.svelte'
	import { deLocalizeHref } from '$lib/paraglide/runtime'
	import '@fontsource/roboto-slab/300.css'
	import '@fontsource/roboto-slab/500.css'
	import '@fontsource/roboto-slab/700.css'
	import robotoSlabLatin300 from '@fontsource/roboto-slab/files/roboto-slab-latin-300-normal.woff2'
	import '@fontsource/saira-condensed/700.css'
	import sairaCondensedLatin700 from '@fontsource/saira-condensed/files/saira-condensed-latin-700-normal.woff2'
	import { ProgressBar } from '@prgm/sveltekit-progress-bar'
	import { onMount } from 'svelte'
	import { Toaster } from 'svelte-french-toast'
	import '../styles/print.css'
	import '../styles/styles.css'
	import Footer from './footer.svelte'
	import Header from './header.svelte'
	import PageTransition from './transition.svelte'

	export let data

	// We use $page store instead of data prop for more reliable navigation
	// This prevents "undefined" issues during navigation

	let eventFound: boolean
	let geo: GeoApiResponse | null = null
	// Show the hero on the homepage, but nowhere else
	$: hero = deLocalizeHref($page.url.pathname) === '/'

	$: if (browser && deLocalizeHref($page.url.pathname) === '/india-summit-2026') {
		localStorage.setItem('campaign_banner_india-summit-2026_hidden', 'true')
	}

	onMount(async () => {
		const response = await fetch('/api/geo')
		geo = await response.json()
	})
</script>

<PreloadFonts urls={[robotoSlabLatin300, sairaCondensedLatin700]} />

<h2 style="width: 0; height: 0; margin: 0; padding: 0; visibility: hidden;" data-pagefind-ignore>
	Top
</h2>

<div class="page-top" class:hero-page={hero}>
	<!-- Make sure we only show one banner at a time-->
	{#if data.localeAlert}
		<Banner
			contrast={data.localeAlert.isDev}
			id={data.localeAlert.isDev ? undefined : 'locale-switch'}
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags not vulnerable against XSS -->
			{@html data.localeAlert.message}
		</Banner>
	{:else if geo?.country?.code === 'GB' && false}
		<Banner contrast={hero}>
			<b
				>PauseAI's largest ever protest will be on Saturday February 28th in London. <Link
					href="https://luma.com/o0p4htmk">Sign up now!</Link
				></b
			>
		</Banner>
	{:else}
		<NearbyEvent contrast={hero} bind:eventFound {geo} />
		{#if !eventFound}
			{#if geo?.country?.code === 'US' && false}
				<Banner contrast={hero}>
					<b
						>HELP US PROTECT STATE SOVEREIGNTY ON AI REGULATION | <Link
							href="https://mstr.app/b09fa92b-1899-43a0-9d95-99cd99c9dfb2">ACT NOW »</Link
						></b
					>
				</Banner>
			{:else if false}
				<Banner contrast={hero} target="/littlehelpers">
					<strong>🎄 Holiday Matching Campaign!</strong> Help fund volunteer stipends for PauseAI
					advocates. <Link href="/littlehelpers">Join the Little Helpers campaign →</Link>
				</Banner>
			{/if}
		{/if}
	{/if}

	{#if deLocalizeHref($page.url.pathname) !== '/brussels-ep-protest-2026' && false}
		<CampaignBanner href="/brussels-ep-protest-2026" id="brussels-ep-protest-2026">
			<strong>Brussels, Feb 23</strong> - Join us outside the European Parliament to call for a global
			treaty to pause frontier AI development.
		</CampaignBanner>
	{/if}

	{#if hero}
		<div class="hero-section">
			<Hero />
			<Header inverted />
		</div>
	{/if}
</div>

<div class="layout" class:hero-page={hero}>
	{#if $page.route.id === '/sayno'}
		<!-- Dynamic import and render the selfie UX component -->
		{#await import('./sayno/SelfieUX.svelte') then module}
			<svelte:component this={module.default} />
		{/await}
	{/if}

	{#if !hero}
		<Header />
	{/if}

	<main>
		<PageTransition url={$page.url.pathname}>
			<slot></slot>
		</PageTransition>
	</main>

	<Footer />
</div>

<Toaster
	toastOptions={{
		style: 'background-color: var(--bg-subtle); color: var(--text)',
		iconTheme: {
			primary: 'var(--brand)',
			secondary: 'white'
		}
	}}
/>

{#if !['/', '/communities', '/outcomes', '/pdoom', '/quotes', '/dear-sir-demis-2025'].includes(deLocalizeHref($page.url.pathname))}
	<Toc />
{/if}

<ProgressBar color="var(--brand)" />

<style>
	/* @import url('$lib/reset.css');
	@import url('$lib/theme.css'); */

	/* .wrapper {
		color: var(--t-text);
		max-width: 50rem;
		margin: auto;
	} */

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
		height: 100dvh;
	}

	.page-top.hero-page > :global(.banner),
	.page-top.hero-page > :global(.campaign-banner) {
		flex-shrink: 0;
	}

	.page-top.hero-page .hero-section {
		flex: 1;
		min-height: var(--hero-min-height);
	}

	.hero-section {
		position: relative;
	}

	.hero-section :global(nav) {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		width: min(var(--page-width), 100% - 2 * var(--page-gutter));
		margin-inline: auto;
		z-index: 1;
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
