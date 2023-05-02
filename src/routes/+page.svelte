<script lang="ts">
	import Block from '$lib/components/Block.svelte';
	export let data: {
		slug: string;
	};
</script>

<Block linkText="Read why" href="/xrisk">
	<span slot="title">A 10% RISK OF HUMAN EXTINCTION</span>
	A recent survey of AI researchers shows that over half of them think there’s at least a 1 in 10 chance
	that AI could end all life on earth.
</Block>
<Block linkText="Get in action" href="/urgency">
	<span slot="title">WE NEED TO ACT RIGHT NOW</span>
	In 2020, experts thought we had more than 35 years until AGI. It took us less than three. Superintelligent
	systems might be one innovation away, and could happen in months.</Block
>
<Block linkText="Read the proposal" href="/proposal">
	<span slot="title">Our proposal</span>
	Stop the development of AI systems more powerful than GPT-4. This needs to happen on an international
	level.
</Block>
