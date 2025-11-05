<script lang="ts">
	/**
	 * Generic social share buttons component.
	 *
	 * Uses collagen tracking URLs to track share intent and redirect to platform-specific
	 * share dialogs: https://collagen.pauseai.info/t/{campaign}/{uid}/share/{platform}
	 *
	 * If no uid provided, uses "0" as dummy UID.
	 */

	import Facebook from '$lib/components/icons/facebook.svelte'
	import X from '$lib/components/icons/x.svelte'
	import Whatsapp from '$lib/components/icons/whatsapp.svelte'
	import Linkedin from '$lib/components/icons/linkedin.svelte'
	import Reddit from '$lib/components/icons/reddit.svelte'

	export let campaign: string // Campaign name (e.g., "sayno")
	export let uid: string | null = null // Optional referral tracking ID

	const COLLAGEN_BASE = 'https://collagen.pauseai.info'

	// Social share platforms (names must match Lambda platform routes)
	const platforms = [
		{ name: 'facebook', component: Facebook, label: 'Facebook' },
		{ name: 'twitter', component: X, label: 'Twitter/X' },
		{ name: 'whatsapp', component: Whatsapp, label: 'WhatsApp' },
		{ name: 'linkedin', component: Linkedin, label: 'LinkedIn' },
		{ name: 'reddit', component: Reddit, label: 'Reddit' }
	]

	function handleShare(platform: string) {
		const effectiveUid = uid || '0'
		const url = `${COLLAGEN_BASE}/t/${campaign}/${effectiveUid}/share/${platform}`
		window.open(url, '_blank', 'width=600,height=400')
	}
</script>

<div class="share-buttons">
	{#each platforms as platform}
		<button
			class="share-button"
			on:click={() => handleShare(platform.name)}
			aria-label="Share on {platform.label}"
		>
			<span class="icon">
				<svelte:component this={platform.component} />
			</span>
			<span class="label">{platform.label}</span>
		</button>
	{/each}
</div>

<style>
	.share-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		justify-content: center;
		margin: 1.5rem 0;
	}

	.share-button {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 0.875rem 0.75rem;
		min-width: 90px;
		background-color: var(--brand);
		border: 2px solid var(--brand);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		font-family: inherit;
	}

	.share-button:hover {
		background-color: var(--brand-dark, #d65d0e);
		border-color: var(--brand-dark, #d65d0e);
		transform: translateY(-2px);
	}

	.share-button:active {
		transform: translateY(0);
	}

	.icon {
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon :global(svg) {
		width: 100%;
		height: 100%;
		fill: white;
	}

	.label {
		font-size: 0.9rem;
		font-weight: 500;
		color: white;
	}

	@media (max-width: 768px) {
		.share-buttons {
			gap: 0.75rem;
		}

		.share-button {
			min-width: 80px;
			padding: 0.75rem;
		}

		.icon {
			width: 1.5rem;
			height: 1.5rem;
		}

		.label {
			font-size: 0.8rem;
		}
	}
</style>
