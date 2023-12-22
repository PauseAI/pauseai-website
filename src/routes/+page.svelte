<script lang="ts">
	import Block from '$lib/components/Block.svelte'
	import Mark from '$lib/components/Mark.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'

	const title = 'We need to Pause AI'
	const description = 'We are risking human extinction. We need to pause AI development, right now.'
</script>

<PostMeta {title} {description} />

<section>
	<Block linkText="Read about the risks" href="/risks">
		<span slot="title">We risk <Mark>losing control</Mark></span>
		AI can have amazing benefits, but it could also could erode our democracy, could destabilize our
		economy and could be used to create powerful cyber weapons.
	</Block>
	<Block linkText="Why and how AI can kill us" href="/xrisk">
		<span slot="title">We risk <Mark>human extinction</Mark></span>
		Many AI labs and experts agree: AI could end humanity.
	</Block>
	<Block linkText="Read the proposal" href="/proposal">
		<span slot="title">We need a <Mark>pause</Mark></span>
		Stop the development of AI systems more powerful than GPT-4, until we know how to make it safety.
		This needs to happen on an international level, and it needs to happen soon.
	</Block>
	<Block linkText="How long do we have?" href="/urgency">
		<span slot="title">WE NEED TO ACT <Mark>RIGHT NOW</Mark></span>
		In 2020, experts thought we had more than 35 years until AGI. Recent breakthroughs show we might
		be almost there. Superintelligence could be one innovation away, so we should tread carefully.</Block
	>
	<Block linkText="Take action" href="/join">
		<span slot="title"><Mark>YOU</Mark> CAN HELP</span>
		Too few people are well-informed about the potential risks of AI. Inform others, and help stop this
		race to the bottom.</Block
	>
</section>
