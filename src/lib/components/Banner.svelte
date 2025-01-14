<script lang="ts">
	import X from 'lucide-svelte/icons/x'
	import { page } from '$app/stores'

	export let contrast = false
	export let target: string | null = null

	let hidden = false

	$: {
		const path = $page.url.pathname
		if (path == target) hidden = true
	}
</script>

<div class="banner" class:contrast class:hidden>
	<span class="content">
		<slot />
	</span>
	<button class="button-to-link close" title="Close" on:click={() => (hidden = true)}>
		<X size="1.2em" />
	</button>
</div>

<style>
	.banner {
		--scroll-bar-width: 0px;
		position: relative;
		display: flex;
		justify-content: center;
		width: 100%;
		background-color: var(--brand);
		padding: 0.5em;
		box-sizing: border-box;
	}

	.banner.hidden {
		display: none;
	}

	.banner.contrast {
		color: white;
		background-color: black;
	}

	.banner.contrast :global(a:hover),
	.banner.contrast .close:hover {
		color: var(--brand);
	}

	.banner.contrast .content::selection {
		color: black;
		background-color: var(--brand);
	}

	.banner :global(a) {
		color: unset;
	}

	.banner :global(a:hover),
	.close:hover {
		color: var(--brand-subtle);
	}

	.content {
		text-align: center;
		margin-inline: 3rem;
	}

	.content::selection {
		color: var(--text);
		background-color: var(--bg-subtle);
	}

	.close {
		position: absolute;
		top: 0;
		right: calc(var(--scroll-bar-width) + 1em);
		bottom: 0;
		display: flex;
		align-items: center;
	}
</style>
