<script lang="ts">
	import X from 'lucide-svelte/icons/x'
	import { browser } from '$app/environment'
	import { onMount } from 'svelte'
	import { fade } from 'svelte/transition'

	export let href: string
	export let id = 'campaign'
	let hidden = false

	function checkStoredState() {
		if (browser && id) {
			const storedState = localStorage.getItem(`campaign_banner_${id}_hidden`)
			if (storedState === 'true') {
				hidden = true
			}
		}
	}

	function close() {
		hidden = true
		if (browser && id) {
			try {
				localStorage.setItem(`campaign_banner_${id}_hidden`, 'true')
			} catch (e) {
				console.error(e)
			}
		}
	}

	onMount(() => {
		checkStoredState()
	})
</script>

{#if !hidden}
	<div class="campaign-banner" transition:fade={{ duration: 200 }}>
		<div class="accent-line"></div>
		<div class="campaign-content">
			<a {href} class="campaign-link">
				<span class="campaign-text">
					<slot />
				</span>
				<span class="campaign-cta">Take action →</span>
			</a>
		</div>
		<button class="campaign-close" on:click|stopPropagation={close}>
			<X size="1em" />
			<span class="sr-only">Close</span>
		</button>
	</div>
{/if}

<style>
	.campaign-banner {
		position: relative;
		width: 100%;
		background: linear-gradient(135deg, hsl(0, 0%, 8%) 0%, hsl(25, 10%, 12%) 100%);
		box-sizing: border-box;
		overflow: hidden;
	}

	.accent-line {
		height: 3px;
		background: linear-gradient(
			90deg,
			var(--brand, #ff9416) 0%,
			hsl(20, 100%, 60%) 50%,
			var(--brand, #ff9416) 100%
		);
	}

	.campaign-content {
		padding: 0.7em 3rem;
		text-align: center;
	}

	.campaign-link {
		display: inline-flex;
		align-items: center;
		gap: 0.8em;
		text-decoration: none;
		color: white;
		font-family: var(--font-body);
		font-weight: 500;
		font-size: 1rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.campaign-link:hover {
		color: white;
	}

	.campaign-link:hover .campaign-cta {
		background: var(--brand, #ff9416);
		color: black;
	}

	.campaign-text {
		line-height: 1.4;
	}

	.campaign-text :global(strong) {
		color: var(--brand, #ff9416);
	}

	.campaign-cta {
		display: inline-block;
		padding: 0.25em 0.8em;
		border: 1.5px solid var(--brand, #ff9416);
		border-radius: 4px;
		color: var(--brand, #ff9416);
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: 0.9em;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
		transition:
			background 0.2s,
			color 0.2s;
	}

	.campaign-close {
		position: absolute;
		top: 0;
		right: 0.5em;
		bottom: 0;
		display: flex;
		align-items: center;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0.75em;
		color: hsl(0, 0%, 50%);
		border-radius: 50%;
		font-size: 0.9rem;
	}

	.campaign-close:hover {
		color: white;
		background-color: rgba(255, 255, 255, 0.1);
	}

	.campaign-close:focus {
		outline: 2px solid currentColor;
	}

	@media (max-width: 40rem) {
		.campaign-content {
			padding: 0.6em 2.5rem 0.6em 1rem;
		}
	}

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
