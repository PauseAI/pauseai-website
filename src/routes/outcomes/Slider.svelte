<script lang="ts">
	import { onMount } from 'svelte'
	import Propability from './Propability.svelte'
	export let probability = 0.5
	import { fade } from 'svelte/transition'
</script>

<div class="percentage-slider" in:fade={{ duration: 200 }}>
	<label for="slider">
		<Propability {probability} showLabel />
	</label>

	<input type="range" id="slider" min="0" max="1" step="0.01" bind:value={probability} />
</div>

<style>
	.percentage-slider {
		/* slider color */
		accent-color: var(--brand);
		width: 10rem;
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
