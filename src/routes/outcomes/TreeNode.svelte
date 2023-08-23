<script lang="ts">
	import Slider from './Slider.svelte'
	import Propability from './Propability.svelte'
	import type { TreeNodeType } from './tree'
	import SelectButton from './SelectButton.svelte'
	import Button from '$lib/components/Button.svelte'
	import { fade } from 'svelte/transition'

	export let node: TreeNodeType
	let probability: number = node.probability
	export let parentProbability: number = 1
	let showInfo = true
	let selected: 'yes' | 'no' | undefined
	export let showProbabilities = false
	$: selectedNode = selected == 'yes' ? node.yes : node.no
	$: selectedProbability = selected == 'yes' ? probability : 1 - probability

	let child: HTMLElement

	function scrollToNextChild() {
		setTimeout(() => {
			if (child) {
				child.scrollIntoView({ behavior: 'smooth' })
			}
		}, 10)
	}
</script>

<div class="node">
	<h2>
		{node.text}
	</h2>

	{#if showInfo}
		<div>
			<p>
				{node.explanation} We estimate this probability at roughly <b>{node.probability * 100}%</b>.
			</p>
		</div>
	{/if}

	<div class="options">
		<SelectButton yes={false} bind:selected onClick={scrollToNextChild} />
		{#if showProbabilities}
			<Slider bind:probability />
		{/if}
		<SelectButton yes={true} bind:selected onClick={scrollToNextChild} />
		{#if showProbabilities}
			{#if probability !== node.probability && showInfo}
				<Button subtle on:click={() => (probability = node.probability)}>Reset</Button>
			{/if}
		{/if}
	</div>

	{#if selected !== undefined}
		{#key selectedNode.text}
			<div class="child" in:fade={{ duration: 200 }} bind:this={child}>
				{#if selectedNode.type == 'question'}
					<svelte:self
						node={selectedNode}
						parentProbability={parentProbability * selectedProbability}
						bind:showProbabilities
					/>
				{:else}
					<h2>
						{#if selectedNode.type == 'doom'}
							💀 Doom️...
						{:else}
							👍 Safety!
						{/if}
					</h2>
					<p>{selectedNode.text}</p>
					<p>
						<b>
							Probability of this outcome: <Propability
								probability={parentProbability * selectedProbability}
							/>
						</b>
					</p>
					<Button on:click={() => (showProbabilities = !showProbabilities)}>
						{showProbabilities ? 'Hide' : 'Show and edit'} probabilities
					</Button>
				{/if}
			</div>
		{/key}
	{/if}
</div>

<style>
	/* node but not the top level one */
	.child {
		margin-top: 20px;
		border-top: solid 3px var(--brand);
	}
	.options {
		display: flex;
		flex-wrap: wrap;
		flex-direction: row;
		/* justify-content: space-between; */
		gap: 1rem;
	}
</style>
