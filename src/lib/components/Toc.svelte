<script lang="ts">
	import { fade } from 'svelte/transition'
	import Toc from 'svelte-toc'
	import X from 'lucide-svelte/icons/x'
	import List from 'lucide-svelte/icons/list'

	let desktop: boolean | undefined
	let open: boolean | undefined
	let headings: HTMLHeadingElement[] | undefined
</script>

{#if open}
	<div transition:fade={{ duration: 100 }} class="backdrop" />
{/if}
<div class="toc-wrapper" style={desktop ? 'display: none;' : ''}>
	<Toc
		headingSelector=":is(h2, h3, h4):not(.toc-exclude):not(footer *)"
		title="Contents"
		bind:open
		bind:desktop
		bind:headings
		hide={(headings?.length ?? 0) <= 1}
	>
		<svelte:fragment slot="open-toc-icon">
			<List size="2rem" />
		</svelte:fragment>
		<svelte:fragment slot="title">
			<div class="toc-head">
				<h2 class="toc-title-heading toc-exclude">Contents</h2>
				<button
					class="toc-close"
					on:click={() => (open = false)}
				>
					<X size="1.2rem" />
				</button>
			</div>
		</svelte:fragment>
	</Toc>
</div>

<style>
	:root {
		--toc-active-color: var(--bg);
		--toc-li-hover-color: var(--brand);
		--toc-li-color: var(--text);
		--toc-mobile-bg: var(--bg);
		--toc-active-bg: var(--brand);
		--toc-max-height: 80vh;
		--toc-padding: 0em 1em 1em;
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

	.toc-head {
		position: sticky;
		top: 0;
		padding: 1em 0em 0.5em;
		background-color: var(--bg);
	}

	.toc-title-heading {
		padding: 0;
		margin: 0;
	}

	.toc-wrapper :global(aside.toc > nav) {
		max-width: 90vw;
	}

	.toc-close {
		background-color: transparent;
		border: none;
		color: var(--text);
		position: absolute;
		top: 0;
		right: 0;
		padding: inherit;
		padding-left: 1rem;
		padding-right: 1rem;
		margin-right: -1rem;
	}

	@media (hover: none) {
		:root {
			--toc-li-hover-color: var(--toc-li-color);
		}
	}

	@media (hover: hover) {
		.toc-wrapper :global(aside.toc > nav > ol > li:hover) {
			text-decoration-line: underline;
		}
		.toc-close:hover {
			color: var(--brand);
		}
	}
</style>
