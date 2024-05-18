<script>
	export let open = false
	import { slide } from 'svelte/transition'
	const handleClick = () => (open = !open)
</script>

<div class="accordion">
	<button on:click={handleClick} class="header">
		<h3 class="title">
			<slot name="head"></slot>
		</h3>

		<span class="icon">+</span>
	</button>

	{#if open}
		<div class="details" transition:slide>
			<slot name="details"></slot>
		</div>
	{/if}
</div>

<style>
	.accordion {
		border-bottom: solid 2px #e6e6e6;
	}

	.header {
		cursor: pointer;
		display: flex;
		width: 100%;
		border: none;
		background-color: transparent;
		text-align: left;
		align-items: center;
		padding: 1.5rem 0;
	}

	.header .title {
		flex: 1;
		font-weight: 400;
	}

	.details {
		padding: 2rem 0 1.5rem 0;
		background-color: #fff;
	}

	.icon {
		font-size: 3rem;
		font-weight: 200;
		line-height: 0;
	}
</style>
