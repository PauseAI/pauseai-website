<script lang="ts">
	import Propability from './Propability.svelte'
	import { fade } from 'svelte/transition'
	interface Props {
		probability?: number
	}

	let { probability = $bindable(0.5) }: Props = $props()
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
