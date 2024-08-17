<script>
	export let message = 'Welcome to our website!'
	export let bgColor = '#4CAF50' // Default background color

	let visible = true // Initially, the banner is visible
</script>

{#if visible}
	<div class="banner" style="--bg-color: {bgColor};">
		<span>{@html message}</span>
		<button class="close-btn" on:click={() => (visible = false)}>×</button>
	</div>
{/if}

<style>
	.banner {
		padding: 16px;
		background-color: var(--bg-color);
		color: var(--black);
		font-family: var(--font-heading);
		font-weight: bold;
		text-align: center;
		font-size: 1.25em;
		position: relative;
	}

	:global(.banner a) {
		font-family: var(--font-heading);
		/* font-weight: 700; */
		color: var(--white);
	}

	:global(.banner a.active) {
		color: var(--black);
	}

	:global(.banner a:hover) {
		color: var(--black);
		text-decoration: underline;
	}

	.close-btn {
		position: absolute;
		top: 10px;
		right: 20px;
		background: none;
		border: none;
		font-size: 1.2em;
		color: var(--black);
		cursor: pointer;
	}
</style>
