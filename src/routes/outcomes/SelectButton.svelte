<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import Propability from './Propability.svelte'
	export let selected: 'yes' | 'no' | undefined
	export let probability: number
	export let yes = false
	export let showProbabilities: boolean
	export let onClick: () => void
	$: current = selected == (yes ? 'yes' : 'no')
</script>

<div class="wrapper {current ? 'selected' : ''}">
	<Button
		subtle={selected && !current}
		on:click={() => {
			selected = yes ? 'yes' : 'no'
			onClick()
		}}
	>
		<div class="inButton">
			{yes ? 'Yes' : 'No'}
			{#if showProbabilities}
				<div class="probabilities">
					<Propability probability={yes ? probability : 1 - probability} />
				</div>
			{/if}
		</div>
	</Button>
</div>

<style>
	.inButton {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.probabilities {
		font-size: 0.7rem;
	}
	.wrapper {
		position: relative;
	}
	.wrapper.selected::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		width: 3px;
		height: 20px;
		background: var(--brand);
	}
</style>
