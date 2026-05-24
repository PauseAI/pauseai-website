<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import TreeNode from './TreeNode.svelte'
	import { tree } from './tree'
	import { outcomesMeta } from './meta'
	import PostMeta from '$lib/components/PostMeta.svelte'

	let intro = $state(true)
	let showProbabilities = $state(false)
	let top: HTMLElement | undefined = $state()
	let { title, description, date } = outcomesMeta
</script>

<PostMeta {title} {description} {date} />

<div class="header">
	<button class="reset-button" onclick={() => (intro = true)} bind:this={top}>
		<h1>{title}</h1>
	</button>
	{#if !intro}
		<div class="headerbuttons">
			<Button subtle onclick={() => (intro = true)}>Restart</Button>
			<!--
			<Button subtle onclick={() => (showProbabilities = !showProbabilities)}
				>{showProbabilities ? 'Hide' : 'Show'} probabilities</Button> 
			-->
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
			onclick={() => {
				intro = false
				showProbabilities = false
			}}>Start</Button
		>
	</div>
{:else}
	<TreeNode node={tree} {top} bind:showProbabilities bind:intro />
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
