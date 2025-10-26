<script lang="ts">
	import { page } from '$app/stores'
	import Banner from '$lib/components/Banner.svelte'
	import Hero from '$lib/components/Hero.svelte'
	import NearbyEvent from '$lib/components/NearbyEvent.svelte'
	import Toc from '$lib/components/Toc.svelte'
	import ExternalLink from '$lib/components/Link.svelte'
	import { deLocalizeHref } from '$lib/paraglide/runtime'
	import '@fontsource/roboto-slab/300.css'
	import '@fontsource/roboto-slab/500.css'
	import '@fontsource/roboto-slab/700.css'
	import '@fontsource/saira-condensed/700.css'
	import { ProgressBar } from '@prgm/sveltekit-progress-bar'
	import { Toaster } from 'svelte-french-toast'
	import '../styles/print.css'
	import '../styles/styles.css'
	import Footer from './footer.svelte'
	import Header from './header.svelte'
	import PageTransition from './transition.svelte'
	import type { GeoApiResponse } from '$api/geo/+server'

	export let data

	// We use $page store instead of data prop for more reliable navigation
	// This prevents "undefined" issues during navigation

	let eventFound: boolean
	let geo: GeoApiResponse | null
	// Show the hero on the homepage, but nowhere else
	$: hero = deLocalizeHref($page.url.pathname) === '/'
</script>

<h2 style="width: 0; height: 0; margin: 0; padding: 0; visibility: hidden;" data-pagefind-ignore>
	(Top)
</h2>

{#if data.localeAlert}
	<Banner
		contrast={data.localeAlert.isDev}
		id={data.localeAlert.isDev ? undefined : 'locale-switch'}
	>
		<!-- eslint-disable-next-line svelte/no-at-html-tags not vulnerable against XSS -->
		{@html data.localeAlert.message}
	</Banner>
{/if}

<div class="layout" class:with-hero={hero}>
	<Header inverted={false} moveUp={false} />
	{#if hero}
		<Hero />
	{/if}

	<main>
		<PageTransition url={$page.url.pathname}>
			<slot />
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

{#if !['/', '/outcomes', '/pdoom', '/quotes', '/dear-sir-demis-2025'].includes(deLocalizeHref($page.url.pathname))}
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

	.layout {
		height: 100%;
		position: relative;
		max-inline-size: var(--page-width);
		display: grid;
		grid-template-rows: auto 1fr auto;
		grid-auto-columns: 100%;
		margin-inline: auto;
		--padding-big: 3rem;
		--padding-small: 1rem;
		padding: 0 var(--padding-big) 0 var(--padding-big);
	}

	/* Media query not strictily necessary */
	@media (max-width: 750px) {
		.layout {
			--transition-padding-from: 750px;
			--transition-padding-until: calc(
				var(--transition-padding-from) - 2 * (var(--padding-big) - var(--padding-small))
			);
			--padding-left-right: clamp(
				var(--padding-small),
				calc(var(--padding-small) + (100vw - var(--transition-padding-until)) / 2),
				var(--padding-big)
			);
			padding-left: var(--padding-left-right);
			padding-right: var(--padding-left-right);
		}
	}

	main {
		padding-block: 1rem;
		margin-bottom: 5rem;
	}

	/* @media (min-width: --page-width) {
		.layout {
			padding: 0;
		}
	} */
</style>
