<script lang="ts">
	import Block from '$lib/components/Block.svelte'
	import LatestNews from '$lib/components/LatestNews.svelte'
	import NewsletterSignup from '$lib/components/NewsletterSignup.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import PreloadFonts from '$lib/components/PreloadFonts.svelte'
	import QuotesCarousel from '$lib/components/QuotesCarousel.svelte'
	import PressLogos from '$lib/components/PressLogos.svelte'
	import Stats from '$lib/components/Stats.svelte'
	import * as m from '$lib/paraglide/messages.js'
	import robotoSlabLatin700 from '@fontsource/roboto-slab/files/roboto-slab-latin-700-normal.woff2'

	const title = 'We need to Pause AI'
	const description = 'We are risking human extinction. We need to pause AI development, right now.'
</script>

<PreloadFonts urls={[robotoSlabLatin700]} />

<PostMeta {title} {description} />
<div style="height: 4rem;" />

<LatestNews />
<div class="divider" />
<QuotesCarousel />
<div class="divider" />

<Stats />
<div class="divider" />
<PressLogos />
<div class="divider" />
<section>
	<Block linkText={m.home_risks_c2a()} href="/risks">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- static content -->
		<span slot="title">{@html m.home_risks_title()}</span>
		{m.home_risks_content()}
	</Block>
	<Block linkText={m.home_proposal_c2a()} href="/proposal">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- static content -->
		<span slot="title">{@html m.home_proposal_title()}</span>
		{m.home_proposal_content()}
	</Block>
	<Block linkText={m.home_action_c2a()} href="/action">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- static content -->
		<span slot="title">{@html m.home_action_title()}</span>
		{m.home_action_content()}
	</Block>
</section>

<NewsletterSignup />

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
