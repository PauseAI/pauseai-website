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
<div class="divider" />
<Stats />
<div class="divider" />
<section>
	<Block linkText={m.home_risks_c2a()} href="/risks">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- static content -->
		<span slot="title">{@html m.home_risks_title()}</span>
		{m.home_risks_content()}
	</Block>
	<Block linkText={m.home_xrisk_c2a()} href="/xrisk">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- static content -->
		<span slot="title">{@html m.home_xrisk_title()}</span>
		{m.home_xrisk_content()}
	</Block>
	<Block linkText={m.home_proposal_c2a()} href="/proposal">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- static content -->
		<span slot="title">{@html m.home_proposal_title()}</span>
		{m.home_proposal_content()}
	</Block>
	<Block linkText={m.home_urgency_c2a()} href="/urgency">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- static content -->
		<span slot="title">{@html m.home_urgency_title()}</span>
		{m.home_urgency_content()}
	</Block>
	<Block linkText={m.home_action_c2a()} href="/action">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- static content -->
		<span slot="title">{@html m.home_action_title()}</span>
		{m.home_action_content()}
	</Block>
</section>

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
