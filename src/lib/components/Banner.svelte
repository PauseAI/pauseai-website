<script lang="ts">
	import { X } from 'lucide-svelte'
	let visible = true // Initially, the banner is visible
</script>

{#if visible}
	<div class="banner">
		<div class="banner-message"><slot /></div>
		<button class="close-btn" on:click={() => (visible = false)}><X /></button>
	</div>
{/if}

<style>
	.banner {
		background-color: var(--brand);
		text-align: center;
		color: var(--black);
		font-family: var(--font-heading);
		display: flex;
		align-items: center;
	}

	.banner-message {
		flex-grow: 1;
	}

	:global(.banner a) {
		font-weight: bold;
	}

	:global(.banner a.active) {
		color: var(--black);
	}

	:global(.banner a:hover) {
		color: var(--black);
	}

	.close-btn {
		display: flex;
		justify-content: center;
		align-items: center;
		color: var(--black);
		cursor: pointer;

		/* Appropriate tap targets */
		height: 48px;
		min-width: 48px;
	}
</style>
