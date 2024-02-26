<script lang="ts">
	import { fade } from 'svelte/transition'
	import Toc from 'svelte-toc'
	import X from 'lucide-svelte/icons/x'

	let closeButton: HTMLElement
	let desktop: boolean
	let open: boolean
	let nav: HTMLElement | undefined

	$: {
		nav?.appendChild(closeButton)
	}
</script>

{#if open}
	<div transition:fade={{ duration: 100 }} class="backdrop" />
{/if}
<div class="toc-wrapper" style={desktop ? 'display: none;' : ''}>
	<Toc
		headingSelector=":is(h2, h3, h4):not(.toc-exclude):not(footer *)"
		title="Contents"
		bind:open
		bind:nav
		bind:desktop
	/>
</div>

<button
	id="toc-close"
	on:click={() => (open = false)}
	bind:this={closeButton}
	style={nav ? '' : 'display: none;'}
>
	<X size="1.2rem" />
</button>

<style>
	:root {
		--toc-active-color: var(--bg);
		--toc-li-hover-color: var(--brand);
		--toc-li-color: var(--text);
		--toc-mobile-bg: var(--bg);
		--toc-active-bg: var(--brand);
		--toc-max-height: 80vh;
		--toc-padding: 1em;
		--toc-z-index: 10;
	}

	.backdrop {
		backdrop-filter: contrast(0.8);
		-webkit-backdrop-filter: contrast(0.8);
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
	}

	.toc-wrapper :global(aside.toc > nav) {
		max-width: 90vw;
	}

	.toc-wrapper :global(aside.toc > nav > ol > li:hover) {
		text-decoration-line: underline;
	}

	#toc-close {
		background-color: transparent;
		border: none;
		color: var(--text);
		position: absolute;
		top: 0;
		right: 0;
		padding: inherit;
	}

	#toc-close:hover {
		color: var(--brand);
	}
</style>
