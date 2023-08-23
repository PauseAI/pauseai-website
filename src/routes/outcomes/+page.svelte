<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import TreeNode from './TreeNode.svelte'
	import { tree } from './tree'

	let intro = true
	let showProbabilities = false
</script>

<h1>AI outcomes</h1>
{#if intro}
	<p>Will AI lead to our utopia, doom, or will we simply continue to do our thing?</p>
	<p>
		This app is designed to help you explore these outcomes and let you draw your own conclusions.
		At any point you can go back and try other paths. Once you've landed on an outcome, you can edit
		the probabilities to determine how likely that path is.
	</p>
	<div class="wrapper">
		<Button on:click={() => (intro = false)}>Start normal</Button>
		<Button
			subtle
			on:click={() => {
				intro = false
				showProbabilities = true
			}}>Start with probabilities</Button
		>
	</div>
{:else}
	<TreeNode node={tree} {showProbabilities} />
{/if}

<style>
	.wrapper {
		display: flex;
		gap: 1rem;
	}
</style>
