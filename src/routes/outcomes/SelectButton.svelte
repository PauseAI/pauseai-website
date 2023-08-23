<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	export let selected: 'yes' | 'no' | undefined
	export let yes = false
	export let onClick: () => void
	$: current = selected == (yes ? 'yes' : 'no')
</script>

<div class="wrapper {current ? 'selected' : ''}">
	<Button
		subtle={selected && !current}
		on:click={() => {
			selected = yes ? 'yes' : 'no'
			onClick()
		}}>{yes ? 'Yes' : 'No'}</Button
	>
</div>

<style>
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
