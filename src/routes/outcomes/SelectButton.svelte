<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import Propability from './Propability.svelte'
	interface Props {
		selected: 'yes' | 'no' | undefined
		probability: number
		yes?: boolean
		showProbabilities: boolean
		onClick: () => void
	}

	let {
		selected = $bindable(),
		probability,
		yes = false,
		showProbabilities,
		onClick
	}: Props = $props()
	let current = $derived(selected == (yes ? 'yes' : 'no'))
</script>

<div class="wrapper {current ? 'selected' : ''}">
	<Button
		subtle={selected && !current}
		onclick={() => {
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
