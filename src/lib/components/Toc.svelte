<script lang="ts">
	import Toc from 'svelte-toc'
	import X from 'lucide-svelte/icons/x'
	import List from 'lucide-svelte/icons/list'
	import '$lib/components/Card.css'
	import Backdrop from '$lib/components/Backdrop.svelte'
	import { onMount } from 'svelte'

	let desktop: boolean | undefined
	let open: boolean | undefined
	let headings: HTMLHeadingElement[] | undefined
	let sidebarTop = 16 // Initial top offset in rem (below banner)

	// Track scroll to adjust sidebar position
	onMount(() => {
		const bannerHeight = 275 // Scroll distance in pixels for full transition (higher = slower)
		const minTop = 1 // Minimum top value in rem when scrolled past banner
		const maxTop = 16 // Maximum top value in rem when at page top

		function handleScroll() {
			const scrollY = window.scrollY
			// Calculate top value based on scroll position
			// As user scrolls down, reduce the top value
			const remValue = Math.max(minTop, maxTop - (scrollY / bannerHeight) * (maxTop - minTop))
			sidebarTop = remValue
		}

		window.addEventListener('scroll', handleScroll, { passive: true })
		handleScroll() // Initial call

		return () => {
			window.removeEventListener('scroll', handleScroll)
		}
	})

	function autoScroll(node: HTMLElement) {
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
					const target = mutation.target as HTMLElement
					if (target.classList.contains('active')) {
						target.scrollIntoView({ block: 'center', behavior: 'smooth' })
					}
				}
			}
		})

		observer.observe(node, {
			attributes: true,
			subtree: true,
			attributeFilter: ['class']
		})

		return {
			destroy() {
				observer.disconnect()
			}
		}
	}
</script>

<!-- Mobile: Backdrop for popup -->
<Backdrop {open} />

<!-- Desktop: Fixed sidebar on the left -->
{#if desktop}
	<div class="desktop-toc-wrapper" style="top: {sidebarTop}rem;" use:autoScroll>
		<Toc
			headingSelector=":is(h2, h3, h4):not(.toc-exclude):not(footer *)"
			title="Contents"
			bind:headings
			hide={(headings?.length ?? 0) <= 2}
			open={true}
			desktop={true}
		>
			<svelte:fragment slot="title">
				<h2 class="toc-title-heading toc-exclude">Contents</h2>
			</svelte:fragment>
		</Toc>
	</div>
{/if}

<!-- Mobile: Floating button with popup (hidden on desktop) -->
<div class="toc-wrapper card" class:hidden-on-desktop={desktop}>
	<Toc
		headingSelector=":is(h2, h3, h4):not(.toc-exclude):not(footer *)"
		title="Contents"
		breakpoint={1250}
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
					aria-label="Close table of contents"
				>
					<X size="1.2rem" />
				</button>
			</div>
		</svelte:fragment>
	</Toc>
</div>

<style>
	:root {
		--toc-active-color: var(--brand);
		--toc-li-hover-color: var(--brand);
		--toc-li-color: var(--text);
		--toc-mobile-bg: var(--bg);
		--toc-active-bg: transparent;
		--toc-max-height: 80vh;
		--toc-padding: 0em 1em 1em;
		--toc-z-index: 10;
	}

	/* Desktop sidebar: fixed on left */
	.desktop-toc-wrapper {
		position: fixed;
		/* top is set dynamically via inline style */
		width: 220px;
		max-height: calc(100vh - 3rem); /* Extend nearly to bottom of viewport */
		overflow-y: auto;
		background-color: transparent;
		z-index: 5;
		padding: 1rem;
		font-size: 0.85rem;

		/* Hide scrollbar but allow scrolling */
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* IE and Edge */
	}

	.desktop-toc-wrapper::-webkit-scrollbar {
		display: none; /* Chrome, Safari, Opera */
	}

	.desktop-toc-wrapper :global(.toc) {
		background-color: transparent;
	}

	.desktop-toc-wrapper :global(.toc > nav) {
		background-color: transparent;
	}

	.desktop-toc-wrapper :global(aside.toc > nav > ol) {
		padding-left: 0;
	}

	.desktop-toc-wrapper :global(aside.toc > nav > ol > li) {
		margin-bottom: 0.5rem;
	}

	/* Hide open button on desktop ToC */
	.desktop-toc-wrapper :global(button.toc-icon) {
		display: none;
	}

	/* Hide the arrows/navigation bar */
	.desktop-toc-wrapper :global(.toc-title),
	.desktop-toc-wrapper :global(.toc-nav),
	.desktop-toc-wrapper :global(.toc-header) {
		display: none !important;
	}

	/* Hide all buttons in desktop sidebar */
	.desktop-toc-wrapper :global(button) {
		display: none !important;
	}

	/* Remove inner scrollbar - only wrapper should scroll */
	.desktop-toc-wrapper :global(nav) {
		max-height: none;
		overflow: visible;
	}

	/* Hide mobile wrapper on desktop */
	.hidden-on-desktop {
		display: none;
	}

	/* Mobile styles */
	.toc-head {
		position: sticky;
		top: 0;
		padding: 1em 0em 0.5em;
		background-color: inherit;
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

	.toc-wrapper :global(.toc) {
		background-color: inherit;
		border-radius: inherit;
		box-shadow: inherit;
	}

	.toc-wrapper :global(.toc > nav) {
		background-color: inherit;
		border-radius: inherit;
		box-shadow: inherit;
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
		.desktop-toc-wrapper :global(aside.toc > nav > ol > li:hover) {
			text-decoration-line: underline;
		}
		.toc-close:hover {
			color: var(--brand);
		}
	}
</style>
