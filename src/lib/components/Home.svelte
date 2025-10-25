<script lang="ts">
	import Block from '$lib/components/Block.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import QuotesCarousel from '$lib/components/QuotesCarousel.svelte'
	import Stats from '$lib/components/Stats.svelte'
	import * as m from '$lib/paraglide/messages.js'

	const title = 'Tenemos que pausar la IA'
	const description =
		'Nos arriesgamos a la extinción de la humanidad. Tenemos que pausar el desarrollo de IA, ahora mismo'
</script>

<PostMeta {title} {description} />
<!-- The Hero image is in `+layout.svelte` -->

<div style="height: 5rem;" />

<QuotesCarousel />

<style>
	.divider {
		content: '';
		display: block;
		height: 0.1rem;
		margin: 5rem 0;
		background: var(--bg-subtle);
		width: 100%;
	}
</style>
