<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import TreeNode from './TreeNode.svelte'
	import { tree } from './tree'
	import { outcomesMeta } from './meta'
	import PostMeta from '$lib/components/PostMeta.svelte'

	let intro = true
	let showProbabilities = false
	let top: HTMLHeadingElement
	let { title, description, date } = outcomesMeta
</script>

<PostMeta {title} {description} {date} />

<div class="header">
	<h1 bind:this={top}>AI outcomes</h1>
	{#if !intro}
		<div class="headerbuttons">
			<Button subtle on:click={() => (intro = true)}>Restart</Button>
			<Button subtle on:click={() => (showProbabilities = !showProbabilities)}
				>{showProbabilities ? 'Hide' : 'Show'} probabilities</Button
			>
		</div>
	{/if}
</div>
{#if intro}
	<p>Will AI lead to our utopia, doom, or will we simply continue to do our thing?</p>
	<p>
		This app is designed to help you explore these outcomes, think in probabilities instead of
		certainty and let you draw your own conclusions. At any point you can go back and try other
		paths.
	</p>
	<div class="wrapper">
		<Button
			on:click={() => {
				intro = false
				showProbabilities = false
			}}>Start</Button
		>
	</div>
{:else}
	<TreeNode node={tree} bind:showProbabilities bind:top bind:intro />
{/if}

<style>
	@media (max-width: 768px) {
		.header {
			display: flex;
			gap: 1rem;
			flex-wrap: wrap;
		}
	}

	h1 {
		margin: 0;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 3rem;
	}

	.headerbuttons {
		display: flex;
		gap: 1rem;
	}
	.wrapper {
		display: flex;
		gap: 1rem;
	}
</style>
