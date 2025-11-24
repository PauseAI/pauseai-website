<script lang="ts">
	import StatBlock from './StatBlock.svelte'
	import * as m from '$lib/paraglide/messages'
</script>

<div class="stats-container">
	<StatBlock percentage={86} text={m.home_stats_alignment()} link="/polls-and-surveys" />
	<StatBlock percentage={72} text={m.home_stats_citizens()} link="/polls-and-surveys" />
</div>

<style>
	.stats-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
