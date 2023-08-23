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
	/** If you want to show probabilities*/
	export let probabilities = false
	$: selectedNode = selected == 'yes' ? node.yes : node.no
	$: selectedProbability = selected == 'yes' ? probability : 1 - probability
</script>

<div class="node">
	<p>
		<b>{node.text}</b>
	</p>

	{#if showInfo}
		<div>
			<p>
				{node.explanation} We estimate this probability at roughly <b>{node.probability * 100}%</b>.
			</p>
		</div>
	{/if}

	<div class="options">
		<SelectButton yes={false} bind:selected />
		{#if probabilities}
			<Slider bind:probability />
		{/if}
		<SelectButton yes={true} bind:selected />
		{#if probabilities}
			{#if probability !== node.probability && showInfo}
				<Button on:click={() => (probability = node.probability)}>set to suggestion</Button>
			{/if}
		{/if}
	</div>

	{#if selected !== undefined}
		{#key selectedNode.text}
			<div class="child" in:fade={{ duration: 200 }} out:fade={{ duration: 200 }}>
				{#if selectedNode.type == 'question'}
					<svelte:self
						node={selectedNode}
						parentProbability={parentProbability * selectedProbability}
						bind:probabilities
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
								decimals={1}
							/>
						</b>
					</p>
					<Button on:click={() => (probabilities = !probabilities)}>
						{probabilities ? 'Hide' : 'Show and edit'} probabilities
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
		flex-direction: row;
		/* justify-content: space-between; */
		gap: 1rem;
	}
</style>
