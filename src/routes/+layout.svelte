<script lang="ts">
	import Footer from './footer.svelte'
	import Header from './header.svelte'
	import PageTransition from './transition.svelte'

	import '@fontsource/roboto-slab/300.css';
	import '@fontsource/roboto-slab/700.css';
	import '@fontsource/saira-condensed/700.css';

	import '../app.css'

	export const data = { url: '' }
</script>

<div class="layout">
	<Header />

	<main>
		<PageTransition url={data.url}>
			<slot />
		</PageTransition>
	</main>

	<Footer />
</div>

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
		max-inline-size: var(--page-width);
		display: grid;
		grid-template-rows: auto 1fr auto;
		grid-auto-columns: 100%;
		margin-inline: auto;
		padding: 1rem;
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
