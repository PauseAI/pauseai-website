<script>
	import X from 'lucide-svelte/icons/x'

	export let shadow = false

	let hidden = false
</script>

<div class="banner" class:shadow class:hidden>
	<span class="content">
		<slot />
	</span>
	<button class="button-to-link close" title="Close" on:click={() => (hidden = true)}>
		<X size="1.2em" />
	</button>
</div>

<style>
	.banner {
		position: relative;
		display: flex;
		justify-content: center;
		width: 100%;
		background-color: var(--brand);
		padding: 0.5em;
	}

	.banner.hidden {
		display: none;
	}

	.banner.shadow {
		z-index: 1;
		box-shadow: 0 0 100px rgba(0, 0, 0, 20%);
	}

	.banner :global(a) {
		color: unset;
	}

	.banner :global(a:hover) {
		color: var(--brand-subtle);
	}

	.content {
		text-align: center;
		margin-inline: 3rem;
	}

	.content::selection {
		background-color: var(--text);
	}

	.close {
		position: absolute;
		top: 0;
		right: calc(15px + 1em);
		bottom: 0;
		display: flex;
		align-items: center;
	}

	.close:hover {
		color: var(--brand-subtle);
	}
</style>
