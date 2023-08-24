<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import TreeNode from './TreeNode.svelte'
	import { tree } from './tree'

	let intro = true
	let showProbabilities = false
	let top: HTMLHeadingElement
</script>

<h1 bind:this={top}>AI outcomes</h1>
{#if intro}
	<p>Will AI lead to our utopia, doom, or will we simply continue to do our thing?</p>
	<p>
		This app is designed to help you explore these outcomes, think in probabilities instead of
		certainty and let you draw your own conclusions. At any point you can go back and try other
		paths.
	</p>
	<div class="wrapper">
		<Button on:click={() => (intro = false)}>Start</Button>
		<Button
			subtle
			on:click={() => {
				intro = false
				showProbabilities = true
			}}>Start with probabilities</Button
		>
	</div>
{:else}
	<TreeNode node={tree} {showProbabilities} bind:top bind:intro />
{/if}

<style>
	.wrapper {
		display: flex;
		gap: 1rem;
	}
</style>
