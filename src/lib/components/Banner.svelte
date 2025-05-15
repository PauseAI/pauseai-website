<script lang="ts">
	import X from 'lucide-svelte/icons/x'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	import { browser } from '$app/environment'
	import { fade } from 'svelte/transition'

	export let contrast = false
	export let target: string | null = null
	export let id: string | null = null

	let hidden = false

	// Function to check localStorage on mount
	function checkStoredState() {
		if (browser && id) {
			const storedState = localStorage.getItem(`banner_${id}_hidden`)
			if (storedState === 'true') {
				hidden = true
				console.log(`Banner ${id} restored from storage as hidden`)
			}
		}
	}

	// Simplest possible click handler
	function closeClick() {
		console.log('Close button clicked! ' + new Date().toISOString())
		hidden = true

		// Save state if we have an ID
		if (browser && id) {
			try {
				localStorage.setItem(`banner_${id}_hidden`, 'true')
				console.log('Saved to localStorage')
			} catch (e) {
				console.error(e)
			}
		}
	}

	$: {
		const path = $page.url.pathname
		if (path === target) hidden = true
	}

	onMount(() => {
		checkStoredState()

		// Debug info
		console.log('Banner component mounted')

		// Extra safety - add global click handler in case event bubbling is an issue
		if (browser) {
			const closeBtn = document.querySelector('.banner-close-btn')
			if (closeBtn) {
				closeBtn.addEventListener('click', (e) => {
					e.preventDefault()
					e.stopPropagation()
					console.log('Direct DOM click handler fired')
					closeClick()
				})
			}
		}
	})
</script>

{#if !hidden}
	<div class="banner" class:contrast transition:fade={{ duration: 200 }}>
		<span class="content">
			<slot />
		</span>

		<!-- Simple button with minimal attributes -->
		<button class="close banner-close-btn" on:click={closeClick}>
			<X size="1.2em" />
			<span class="sr-only">Close</span>
		</button>
	</div>
{/if}

<style>
	.banner {
		position: relative;
		display: flex;
		justify-content: center;
		width: 100%;
		background-color: var(--brand);
		padding: 0.5em;
		box-sizing: border-box;
	}

	.banner.contrast {
		color: white;
		background-color: black;
	}

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

	@media (max-width: 40rem) {
		.content {
			margin-left: 1rem;
		}
	}

	.content::selection {
		color: var(--text);
		background-color: var(--bg-subtle);
	}

	.close {
		position: absolute;
		top: 0;
		right: 0.75em;
		bottom: 0;
		display: flex;
		align-items: center;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0.75em;
		color: inherit;
		border-radius: 50%;
	}

	.close:hover {
		opacity: 0.8;
		background-color: rgba(0, 0, 0, 0.1);
	}

	.close:focus {
		outline: 2px solid currentColor;
	}

	/* Accessibility hidden text */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
