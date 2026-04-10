<script lang="ts">
	import X from 'lucide-svelte/icons/x'
	import { page } from '$app/stores'
	import { fade } from 'svelte/transition'
	import { deLocalizeHref } from '$lib/paraglide/runtime'
	import { setItem } from '$lib/localStorage'
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'

	export let type: 'main' | 'campaign' = 'main'
	export let id: string | null = null
	export let href: string | null = null
	export let contrast = false

	let dismissed = false

	function close() {
		dismissed = true
		if (id) {
			const prefix = type === 'campaign' ? 'campaign_banner' : 'banner'
			setItem(`${prefix}_${id}_hidden`, 'true')
		}
	}

	// Hide on navigation to the target/href page
	$: if (href && deLocalizeHref($page.url.pathname) === href) {
		dismissed = true
	}

	$: isCampaign = type === 'campaign'
	$: dataIdAttr = isCampaign ? 'data-campaign-banner-id' : 'data-banner-id'
</script>

<svelte:head>
	{#if id}
		{@const selector = isCampaign
			? `html[data-active-campaign-banner="${id}"] [data-campaign-banner-id="${id}"]`
			: `html[data-active-banner="${id}"] [data-banner-id="${id}"]`}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html `<style>${selector}{display:flex!important}</style>`}
	{/if}
</svelte:head>

{#if !dismissed}
	<div
		class="banner"
		class:contrast
		class:campaign={isCampaign}
		{...{ [dataIdAttr]: id }}
		data-pagefind-ignore
		transition:fade={{ duration: 200 }}
	>
		{#if isCampaign}
			<div class="accent-line"></div>
		{/if}

		<span class="content">
			{#if isCampaign && href}
				<LinkWithoutIcon {href} class="campaign-link" on:click={close}>
					<span class="campaign-text">
						<slot></slot>
					</span>
					<span class="campaign-cta">Take action →</span>
				</LinkWithoutIcon>
			{:else}
				<slot></slot>
			{/if}
		</span>

		<button
			class="close banner-close-btn"
			class:campaign-close={isCampaign}
			on:click|stopPropagation={close}
		>
			<X size={isCampaign ? '1em' : '1.2em'} />
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

	.banner.campaign {
		flex-direction: column;
		padding: 0;
		background: linear-gradient(135deg, hsl(0, 0%, 8%) 0%, hsl(25, 10%, 12%) 100%);
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

	.banner.campaign .content {
		padding: 0.7em 3rem;
		margin-inline: 0;
	}

	@media (max-width: 40rem) {
		.content {
			margin-left: 1rem;
		}
		.banner.campaign .content {
			padding: 0.6em 2.5rem 0.6em 1rem;
			margin-left: 0;
		}
	}

	.content::selection {
		color: var(--text);
		background-color: var(--bg-subtle);
	}

	.close {
		position: absolute;
		top: 50%;
		right: 0.75em;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0.75em;
		color: inherit;
		border-radius: 50%;
	}

	.close.campaign-close {
		right: 0.5em;
		color: hsl(0, 0%, 50%);
		font-size: 0.9rem;
	}

	.close:hover {
		opacity: 0.8;
		background-color: rgba(0, 0, 0, 0.1);
	}

	.close.campaign-close:hover {
		color: white;
		background-color: rgba(255, 255, 255, 0.1);
		opacity: 1;
	}

	.close:focus {
		outline: 2px solid currentColor;
	}

	/* Campaign specific styles */
	.banner.campaign :global(.campaign-link) {
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

	:global(.campaign-link:hover) .campaign-cta {
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
