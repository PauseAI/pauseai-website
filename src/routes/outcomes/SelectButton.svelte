<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	export let selected: 'yes' | 'no' | undefined
	export let yes = false
	$: current = selected == (yes ? 'yes' : 'no')
</script>

<div class="wrapper {current ? 'selected' : ''}">
	<Button on:click={() => (selected = yes ? 'yes' : 'no')}>{yes ? 'yes' : 'no'}</Button>
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
