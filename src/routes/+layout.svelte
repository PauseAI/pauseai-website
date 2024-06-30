<script lang="ts">
	import { page } from '$app/stores'
	import { fade } from 'svelte/transition'
	import { Toaster } from 'svelte-french-toast'
	import { ProgressBar } from '@prgm/sveltekit-progress-bar'

	import Footer from './footer.svelte'
	import Header from './header.svelte'
	import Toc from '$lib/components/Toc.svelte'

	import '@fontsource/ibm-plex-sans/200.css' // extra-light
	import '@fontsource/ibm-plex-sans/400.css' // regular
	import '@fontsource/ibm-plex-sans/500.css' // medium
	import '@fontsource/ibm-plex-sans/700.css' // bold

	import '../reset.css'
	import '../app.css'

	export let data

	$: bgWhite = $page.url.pathname == '/'
</script>

<h2 style="width: 0; height: 0; margin: 0; padding: 0; visibility: hidden;" data-pagefind-ignore>
	(Top)
</h2>

<div class="layout" class:bgWhite>
	<Header />

	{#key data.url}
		<main in:fade>
			<slot />
		</main>
	{/key}

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
<!-- 
{#if !['/', '/outcomes', '/pdoom', '/quotes'].includes(data.url)}
	<Toc />
{/if} -->

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
		max-inline-size: var(--page-width);
		display: grid;
		grid-template-rows: auto 1fr auto;
		grid-auto-columns: 100%;
		/* margin-inline: auto; */
		/* padding: 1rem; */
		background-color: var(--bg-subtle);
	}

	.layout.bgWhite {
		background-color: var(--bg);
	}

	main {
		/* padding-block: 1rem; */
		/* margin-bottom: 5rem; */
		padding: 1rem;
		display: flex;
		flex-direction: column;
	}

	@media (min-width: 640px) {
		main {
			padding: 0rem 2rem 7.5rem 2rem;
		}
	}

	@media (min-width: 768px) {
		main {
			padding: 0rem 4rem 7.5rem 4rem;
		}
	}
	@media (min-width: 1024px) {
		main {
			padding: 0rem 6rem 7.5rem 6rem;
		}
	}

	@media (min-width: --page-width) {
		/* .layout {
			padding: 0;
	} */
	}
</style>
