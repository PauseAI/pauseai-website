<script lang="ts">
	import Dialog from './Dialog.svelte'

	export let open: boolean
	export let focus = false
	export let style = ''
</script>

<div class="backdrop">
	<Dialog bind:open {focus} {style}>
		<span slot="title"><slot name="title" /></span>
		<slot />
	</Dialog>
</div>

<style>
	.backdrop {
		z-index: 1;
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		backdrop-filter: blur(5px) brightness(90%);
	}
</style>
