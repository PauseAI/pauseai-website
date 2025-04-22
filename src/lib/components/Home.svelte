<script lang="ts">
	import Block from '$lib/components/Block.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import QuotesCarousel from '$lib/components/QuotesCarousel.svelte'
	import Stats from '$lib/components/Stats.svelte'

	const title = 'We need to Pause AI'
	const description = 'We are risking human extinction. We need to pause AI development, right now.'
</script>

<PostMeta {title} {description} />
<!-- The Hero image is in `+layout.svelte` -->

<div style="height: 5rem;" />

<QuotesCarousel />
<div class="divider" />
<Stats />
<div class="divider" />
<section>
	<Block linkText="Read about the risks" href="/risks">
		<span slot="title">We risk <u>losing control</u></span>
		AI can have amazing benefits, but it could also erode our democracy, destabilize our economy and
		could be used to create powerful cyber weapons.
	</Block>
	<Block linkText="How and why AI could kill us" href="/xrisk">
		<span slot="title">We risk <u>human extinction</u></span>
		Many AI labs and experts agree: AI could end humanity.
	</Block>
	<Block linkText="Read the proposal" href="/proposal">
		<span slot="title">We need a <u>pause</u></span>
		Stop the development of the most powerful general AI systems until we know how to make them safe.
		This needs to happen on an international level, and it needs to happen soon.
	</Block>
	<Block linkText="How long do we have?" href="/urgency">
		<span slot="title">WE NEED TO ACT <u>RIGHT NOW</u></span>
		In 2020, experts thought we had more than 35 years until AGI. Recent breakthroughs show we might
		be almost there. Superintelligence could be one innovation away, so we should tread carefully.</Block
	>
	<Block linkText="Take action" href="/action">
		<span slot="title"><u>YOU</u> CAN HELP</span>
		Too few people are well-informed about the potential risks of AI. Inform others, and help stop this
		race to the bottom.</Block
	>
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
