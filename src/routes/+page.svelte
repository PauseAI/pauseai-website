<script lang="ts">
	import Block from '$lib/components/Block.svelte'
	import Mark from '$lib/components/Mark.svelte'

	const title = 'We need to Pause AI'
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:title" content={title} />
	<meta
		property="og:description"
		content="We are risking human extinction. We need to pause AI development, right now."
	/>
</svelte:head>

<section>
	<Block linkText="Read about the risks" href="/risks">
		<span slot="title">We risk <Mark>losing control</Mark></span>
		AI could erode our democracy, could destabilize our economy and could be used to create powerful
		cyberweapons.
	</Block>
	<Block linkText="Why and how AI can kill us" href="/xrisk">
		<span slot="title">We risk <Mark>human extinction</Mark></span>
		Virtually all AI labs and experts agree: AI could end humanity.
	</Block>
	<Block linkText="Read the proposal" href="/proposal">
		<span slot="title">We need a <Mark>pause</Mark></span>
		Stop the development of AI systems more powerful than GPT-4. This needs to happen on an international
		level, and it needs to happen soon.
	</Block>
	<Block linkText="How long do we have?" href="/urgency">
		<span slot="title">WE NEED TO ACT <Mark>RIGHT NOW</Mark></span>
		In 2020, experts thought we had more than 35 years until AGI. We're almost there. Superintelligent
		systems might be one innovation away, and could happen in months.</Block
	>
	<Block linkText="Take action" href="/action">
		<span slot="title"><Mark>YOU</Mark> CAN HELP</span>
		Too few people are aware of AI risks. Get informed, inform others, and help slow this train down.</Block
	>
</section>
