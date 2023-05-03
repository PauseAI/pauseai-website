<script lang="ts">
	import Block from '$lib/components/Block.svelte'
	import Mark from '$lib/components/Mark.svelte'
</script>

<section>
	<Block linkText="Read why" href="/xrisk">
		<span slot="title">WE ARE RISKING <Mark>HUMAN EXTINCTION</Mark></span>
		A recent survey of AI researchers shows that over half of them think there’s at least a 1 in 10 chance
		that AI could end all life on earth. And that number is growing.
	</Block>
	<Block linkText="Get in action" href="/action">
		<span slot="title">WE NEED TO ACT <Mark>RIGHT NOW</Mark></span>
		In 2020, experts thought we had more than 35 years until AGI. It took us less than three. Superintelligent
		systems might be one innovation away, and could happen in months.</Block
	>
	<Block linkText="Read the proposal" href="/proposal">
		<span slot="title">Our proposal</span>
		Stop the development of AI systems more powerful than GPT-4. This needs to happen on an international
		level.
	</Block>
</section>
