<script lang="ts">
	import type { NationalGroup, NationalGroupLink } from '$lib/types'
	import { typedEntries } from '$lib/utils'
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'

	export let nationalGroup: NationalGroup

	const baseImagePath = '/images/'
	const imageUrl = nationalGroup.image || `${baseImagePath}default.png` // Directly use nationalGroup.image or default

	const nationalGroupLinkNames: Record<NationalGroupLink, string> = {
		website: 'Website',
		linktreeLink: 'Linktree',
		instagramLink: 'Instagram',
		tiktokLink: 'TikTok',
		xLink: 'X',
		discordLink: 'Discord',
		whatsappLink: 'WhatsApp',
		facebookLink: 'Facebook',
		youtubeLink: 'YouTube',
		linkedinLink: 'LinkedIn',
		lumaLink: 'Luma',
		substackLink: 'Substack'
	}

	const linkEntries = typedEntries(nationalGroupLinkNames)

	let isOpen = false

	function toggleOpen() {
		isOpen = !isOpen
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<li class="national-group" on:click={toggleOpen} class:is-open={isOpen}>
	<div class="header">
		<div class="icon" class:is-open={isOpen}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="28"
				height="28"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="3"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<polyline points="6 9 12 15 18 9"></polyline>
			</svg>
		</div>
		<div class="image-name-wrapper">
			{#if imageUrl}
				<img src={imageUrl} alt={nationalGroup.name} class="national-group-image" />
			{/if}
			<h3 class="name">{nationalGroup.name}</h3>
		</div>
	</div>

	{#if isOpen}
		<div class="details-wrapper" on:click|stopPropagation>
			{#if linkEntries.some(([key]) => nationalGroup[key])}
				<div class="section">
					<div class="list">
						{#each linkEntries as [key, name]}
							{#if nationalGroup[key]}
								<LinkWithoutIcon
									href={nationalGroup[key]}
									target="_blank"
									rel="noopener noreferrer"
									class="link-item"
								>
									{name}
								</LinkWithoutIcon>
							{/if}
						{/each}
					</div>
				</div>
			{/if}

			{#if nationalGroup.leader !== 'No'}
				<div class="section">
					{#if nationalGroup.email}
						<LinkWithoutIcon href="mailto:{nationalGroup.email}" class="section-title link">
							Leaders:
						</LinkWithoutIcon>
					{:else}
						<span class="section-title">Leaders</span>
					{/if}
					<div class="list">
						{#each nationalGroup.leader.split(', ') as leader}
							<span>{leader}</span>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</li>

<style>
	.national-group {
		margin-bottom: 0;
		display: flex;
		flex-direction: column;
		background-color: var(--bg-2);
		border-radius: 8px;
		overflow: hidden;
		cursor: pointer;
		transition: background-color 0.2s;
		border: 1px solid var(--border);
	}

	.national-group:hover {
		background-color: var(--bg-3);
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		padding: 0.5rem;
		width: 100%;
		gap: 0.5rem;
	}

	.image-name-wrapper {
		display: flex;
		align-items: center;
		flex-grow: 1;
		gap: 0.5rem;
	}

	.icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-1);
		transition: transform 0.2s ease;
		flex-shrink: 0;
		opacity: 0.7;
	}

	.icon.is-open {
		transform: rotate(180deg);
		opacity: 1;
	}

	.details-wrapper {
		padding: 0 0.5rem 0.5rem 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		cursor: default;
	}

	.national-group-image {
		width: 36px;
		height: 36px;
		object-fit: cover;
		border-radius: 50%;
	}

	.name {
		color: var(--text);
		font-family: var(--font-heading);
		font-size: 1.3rem;
		font-weight: bold;
		margin: 0;
		line-height: 1.1;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.section-title {
		font-weight: 600;
		font-size: 0.9rem;
		/* Default color for non-links */
		color: var(--text-2);
	}

	/* Override color for links */
	:global(a.section-title) {
		color: var(--primary) !important;
		text-decoration: none;
	}

	:global(a.section-title:hover) {
		text-decoration: underline;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.95rem;
	}

	:global(.link-item) {
		color: var(--primary) !important;
		text-decoration: none;
	}

	:global(.link-item:hover) {
		text-decoration: underline;
	}
</style>
