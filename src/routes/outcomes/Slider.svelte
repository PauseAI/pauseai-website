<script lang="ts">
	import { onMount } from 'svelte'
	import Propability from './Propability.svelte'
	export let probability: number = 0.5
	import { fade } from 'svelte/transition'

	onMount(() => console.log(`Initial percentage: ${probability}%`))

	// very likely, etc.
	$: label = () => {
		if (probability == 0) return 'impossible'
		if (probability < 0.1) return 'unlikely'
		if (probability < 0.4) return 'maybe'
		if (probability < 0.6) return 'possibly'
		if (probability < 0.9) return 'likely'
		if (probability < 1) return 'probably'
		if (probability == 1) return 'certain'
		return 'very likely'
	}
</script>

<div class="percentage-slider" in:fade={{ duration: 200 }} out:fade={{ duration: 200 }}>
	<label for="slider">
		{label()}
		<Propability {probability} />
	</label>

	<input type="range" id="slider" min="0" max="1" step="0.01" bind:value={probability} />
</div>

<style>
	.percentage-slider {
		/* slider color */
		accent-color: var(--brand);
		width: 13rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	input {
		cursor: pointer;
		width: 100%;
		/* remove border */
		border: none;
	}
</style>
