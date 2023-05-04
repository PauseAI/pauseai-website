<script lang="ts">
	import Block from '$lib/components/Block.svelte'
	import Mark from '$lib/components/Mark.svelte'

	const title = 'PauseAI'
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
	<Block linkText="Read why" href="/xrisk">
		<span slot="title">WE ARE RISKING <Mark>HUMAN EXTINCTION</Mark></span>
		A recent survey of AI researchers shows that half of them think there’s at least a 1 in 10 chance
		that AI could end all life on earth. And that number is growing.
	</Block>
	<Block linkText="Read the proposal" href="/proposal">
		<span slot="title">We need a <Mark>pause</Mark></span>
		Stop the development of AI systems more powerful than GPT-4. This needs to happen on an international
		level, and it needs to happen soon.
	</Block>
	<Block linkText="Get in action" href="/action">
		<span slot="title">WE NEED TO ACT <Mark>RIGHT NOW</Mark></span>
		In 2020, experts thought we had more than 35 years until AGI. We're almost there. Superintelligent
		systems might be one innovation away, and could happen in months.</Block
	>
</section>
