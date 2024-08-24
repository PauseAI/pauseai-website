<script>
	let visible = true // Initially, the banner is visible
</script>

{#if visible}
	<div class="banner">
		<div class="banner-message"><slot /></div>
		<button class="close-btn" on:click={() => (visible = false)}>x</button>
	</div>
{/if}

<style>
	.banner {
		padding: 1rem;
		background-color: var(--brand);
		text-align: center;
		color: var(--black);
		font-family: var(--font-heading);
		position: relative;
		display: flex;
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
		background: none;
		border: none;
		font-size: 1.2em;
		color: var(--black);
		cursor: pointer;
	}
</style>
