<script lang="ts">
	export let open = false
	export let id: string
	const details_id = `${id}-details`
	const title_id = `${id}-title`
	import { slide } from 'svelte/transition'
	const handleClick = () => (open = !open)
</script>

<div class="accordion">
	<button on:click={handleClick} class="header" aria-expanded={open} aria-controls={details_id}>
		<h3 class="title" id={title_id}>
			<slot name="head" />
		</h3>

		<span class="icon">+</span>
	</button>

	{#if open}
		<div class="details" transition:slide id={details_id} aria-labelledby={title_id}>
			<slot name="details" />
		</div>
	{/if}
</div>

<style>
	.accordion:global(:not(:last-child)) {
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
