<script>
	export let open = false
	import { slide } from 'svelte/transition'
	const handleClick = () => (open = !open)
</script>

<div on:click={handleClick} class="accordion">
	<div class="header">
		<div class="text">
			<slot name="head"></slot>
		</div>

		<p>+</p>
	</div>

	{#if open}
		<div class="details" transition:slide>
			<slot name="details"></slot>
		</div>
	{/if}
</div>

<style>
	div.accordion {
		margin: 1rem 0;
		cursor: pointer;
		border-bottom: solid #e6e6e6;
	}

	div.header {
		display: flex;
		width: 100%;
	}

	div.header .text {
		flex: 1;
		margin-right: 5px;
		font-size: 24px;
	}

	div.details {
		background-color: #fff;
	}
</style>
