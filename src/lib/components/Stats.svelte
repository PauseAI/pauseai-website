<script lang="ts">
	import StatBlock from './StatBlock.svelte'
</script>

<div class="stats-container">
	<StatBlock
		percentage="86"
		text="of AI scientists believe the alignment problem is real & important"
		link="/polls-and-surveys"
	/>
	<StatBlock
		percentage="72"
		text="of citizens want AI to be slowed down by our governments"
		link="/polls-and-surveys"
	/>
	<StatBlock percentage="25" text="chance we'll reach AGI in 2025" link="/polls-and-surveys" />
</div>

<style>
	.stats-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
