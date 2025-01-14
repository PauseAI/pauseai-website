<script lang="ts">
	import X from 'lucide-svelte/icons/x'
	import { onMount } from 'svelte'

	export let shadow = false

	let banner: HTMLDivElement
	let hidden = false

	onMount(() => {
		const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
		banner.style.setProperty('--scroll-bar-width', scrollBarWidth + 'px')
	})
</script>

<div class="banner" class:shadow class:hidden bind:this={banner}>
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

	.close:hover {
		color: var(--brand-subtle);
	}
</style>
