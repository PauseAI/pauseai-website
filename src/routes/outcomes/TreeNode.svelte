<script lang="ts">
	import TreeNode from './TreeNode.svelte'
	import Slider from './Slider.svelte'
	import Propability from './Propability.svelte'
	import type { TreeNodeType } from './tree'
	import SelectButton from './SelectButton.svelte'
	import Button from '$lib/components/Button.svelte'
	import { fade } from 'svelte/transition'

	interface Props {
		node: TreeNodeType
		parentProbability?: number
		showProbabilities?: boolean
		top: HTMLElement
		intro: boolean
	}

	let {
		node,
		parentProbability = 1,
		showProbabilities = $bindable(false),
		top,
		intro = $bindable()
	}: Props = $props()
	let probability: number = $derived(node.probability)
	let showInfo = $state(false)
	let selected: 'yes' | 'no' | undefined = $state()
	let selectedNode = $derived(selected == 'yes' ? node.yes : node.no)
	let selectedProbability = $derived(selected == 'yes' ? probability : 1 - probability)

	const scrollToTop = () => {
		setTimeout(() => {
			top.scrollIntoView({ behavior: 'smooth' })
		}, 10)
	}

	let child: HTMLElement
	const scrollToNextChild = () => {
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
		<Button subtle onclick={() => (showInfo = !showInfo)}>Info</Button>
	</div>

	{#if showInfo}
		<div>
			<p>
				{node.explanation}
				<!--PauseAI estimates this probability at roughly
				<b>{node.probability * 100}%</b>.-->
			</p>
		</div>
	{/if}

	<div class="options">
		{#if showProbabilities}
			<Slider bind:probability />
			<!-- {#if probability !== node.probability && showInfo}
				<Button subtle onclick={() => (probability = node.probability)}>Reset</Button>
			{/if} -->
		{:else}
			<!-- <Button subtle onclick={() => (showProbabilities = !showProbabilities)}>
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
					<TreeNode
						node={selectedNode}
						parentProbability={parentProbability * selectedProbability}
						{top}
						bind:showProbabilities
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
					{#if showProbabilities}
						<p>
							<b>
								Probability of this specific outcome path: <Propability
									probability={parentProbability * selectedProbability}
								/>.
							</b>
							This is calculated by multiplying all the probabilities of the values above.
						</p>
					{/if}
					<p>{selectedNode.text}</p>
					<div class="buttons">
						<!--
						<Button
							onclick={() => {
								showProbabilities = !showProbabilities
								scrollToTop()
							}}
						>
							{showProbabilities ? 'Hide' : 'Show'} probabilities
						</Button>-->
						<Button
							subtle
							onclick={() => {
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
