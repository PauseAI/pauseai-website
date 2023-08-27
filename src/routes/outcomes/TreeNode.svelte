<script lang="ts">
	import Slider from './Slider.svelte'
	import Propability from './Propability.svelte'
	import type { TreeNodeType } from './tree'
	import SelectButton from './SelectButton.svelte'
	import Button from '$lib/components/Button.svelte'
	import { fade } from 'svelte/transition'

	export let node: TreeNodeType
	export let parentProbability: number = 1
	export let showProbabilities = false
	export let top: HTMLElement
	export let intro: boolean
	let probability: number = node.probability
	let showInfo = false
	let selected: 'yes' | 'no' | undefined
	$: selectedNode = selected == 'yes' ? node.yes : node.no
	$: selectedProbability = selected == 'yes' ? probability : 1 - probability

	$: scrollToTop = () => {
		setTimeout(() => {
			top.scrollIntoView({ behavior: 'smooth' })
		}, 10)
	}

	let child: HTMLElement
	$: scrollToNextChild = () => {
		setTimeout(() => {
			if (child) {
				child.scrollIntoView({ behavior: 'smooth' })
			}
		}, 10)
	}
</script>

<div class="node">
	<div class="headerWrapper">
		<h2>
			{node.text}
		</h2>
		<Button subtle on:click={() => (showInfo = !showInfo)}>Info</Button>
	</div>

	{#if showInfo}
		<div>
			<p>
				{node.explanation} PauseAI estimates this probability at roughly
				<b>{node.probability * 100}%</b>.
			</p>
		</div>
	{/if}

	<div class="options">
		{#if showProbabilities}
			<Slider bind:probability />
			<!-- {#if probability !== node.probability && showInfo}
				<Button subtle on:click={() => (probability = node.probability)}>Reset</Button>
			{/if} -->
		{:else}
			<!-- <Button subtle on:click={() => (showProbabilities = !showProbabilities)}>
				<Propability {probability} /> chance
			</Button> -->
		{/if}

		<SelectButton
			yes={false}
			bind:selected
			onClick={scrollToNextChild}
			{probability}
			{showProbabilities}
		/>
		<SelectButton
			yes={true}
			bind:selected
			onClick={scrollToNextChild}
			{probability}
			{showProbabilities}
		/>
	</div>

	{#if selected !== undefined}
		{#key selectedNode.text}
			<div class="child" in:fade={{ duration: 200 }} bind:this={child}>
				{#if selectedNode.type == 'question'}
					<svelte:self
						node={selectedNode}
						parentProbability={parentProbability * selectedProbability}
						bind:showProbabilities
						bind:top
						bind:intro
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
							Probability of this specific outcome path: <Propability
								probability={parentProbability * selectedProbability}
							/>
						</b>
					</p>
					<div class="buttons">
						<Button
							on:click={() => {
								showProbabilities = !showProbabilities
								scrollToTop()
							}}
						>
							{showProbabilities ? 'Hide' : 'Show and edit'} probabilities
						</Button>
						<Button
							subtle
							on:click={() => {
								intro = true
								scrollToTop()
							}}>Restart</Button
						>
					</div>
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

	.headerWrapper {
		display: flex;
		flex-direction: row;
		gap: 1rem;
		/* Center */
		align-items: center;
		justify-content: space-between;
	}
	.options {
		display: flex;
		flex-wrap: wrap;
		flex-direction: row;
		/* justify-content: space-between; */
		gap: 1rem;
	}
	.buttons {
		display: flex;
		flex-direction: row;
		gap: 1rem;
	}
</style>
