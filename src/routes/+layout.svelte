<script lang="ts">
	import { Toaster } from 'svelte-french-toast'
	import { ProgressBar } from '@prgm/sveltekit-progress-bar'

	import Footer from './footer.svelte'
	import Header from './header.svelte'
	import PageTransition from './transition.svelte'
	import Toc from '$lib/components/Toc.svelte'

	import '@fontsource/roboto-slab/300.css'
	import '@fontsource/roboto-slab/700.css'
	import '@fontsource/saira-condensed/700.css'

	import '../styles/styles.css'
	import '../styles/print.css'
	import Hero from '$lib/components/Hero.svelte'
	import Banner from '$lib/components/Banner.svelte'
	import { onMount } from 'svelte'

	export let data

	let currentDate: Date | null = null

	onMount(() => {
		currentDate = new Date()
	})

	// Show the hero on the homepage, but nowhere else
	$: hero = data.url == '/'
</script>

<h2 style="width: 0; height: 0; margin: 0; padding: 0; visibility: hidden;" data-pagefind-ignore>
	(Top)
</h2>

{#if !currentDate || currentDate < new Date(2025, 1, 12)}
	<Banner contrast={hero} target="/2025-february">
		On Feb 7–11 we are globally
		protesting the missing safety focus of the AI Action Summit in Paris. |
		<b><a href="/2025-february">Join in! »</a></b>
	</Banner>
{/if}

<div class="layout" class:with-hero={hero}>
	{#if hero}
		<Hero />
	{/if}
	<Header inverted={hero} moveUp={hero} />

	<main>
		<PageTransition url={data.url}>
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

{#if !['/', '/outcomes', '/pdoom', '/quotes'].includes(data.url)}
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

	@media (min-width: --page-width) {
		.layout {
			/* padding: 0; */
		}
	}
</style>
