<script lang="ts">
	import type { NationalGroup, NationalGroupLink } from '$lib/types'
	import { typedEntries } from '$lib/utils'
	//import { sanitizeNameForImage } from '$lib/utils/imageUtils'	//
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'

	export let nationalGroup: NationalGroup

	// Helper function to sanitize names for image filenames
	function sanitizeNameForImage(name: string): string {
		return name
			.replace(/\s+/g, '-') // Replace one or more spaces with a single hyphen
			.replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
	}

	const baseImagePath = '/images/national-groups/'
	const sanitizedName = sanitizeNameForImage(nationalGroup.name) // Use sanitized name
	const possibleImagePaths = [`${baseImagePath}${sanitizedName}.png`]

	let imageUrl: string | undefined

	// A helper function to check if an image exists (client-side only)
	async function checkImage(path: string): Promise<boolean> {
		return new Promise((resolve) => {
			const img = new Image()
			img.onload = () => resolve(true)
			img.onerror = () => resolve(false)
			img.src = path
		})
	}

	// Determine the correct image URL
	;(async () => {
		for (const path of possibleImagePaths) {
			if (await checkImage(path)) {
				imageUrl = path
				return
			}
		}
		imageUrl = `${baseImagePath}default.png` // Fallback to default.png
	})()

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
		lumaLink: 'Luma'
	}

	const linkEntries = typedEntries(nationalGroupLinkNames)
</script>

<li class="national-group">
	<div class="image-and-name-container">
		{#if imageUrl}
			<img src={imageUrl} alt={nationalGroup.name} class="national-group-image" />
		{/if}
		<h3 class="name">{nationalGroup.name}</h3>
	</div>

	<div class="details-container">
		{#if nationalGroup.leader !== 'No'}
			<div class="row">
				<span class="label">Leader:</span>
				{#if nationalGroup.email}
					<LinkWithoutIcon href="mailto:{nationalGroup.email}" class="link">
						{nationalGroup.leader}
					</LinkWithoutIcon>
				{:else}
					<span>{nationalGroup.leader}</span>
				{/if}
			</div>
		{/if}

		{#if linkEntries.some(([key]) => nationalGroup[key])}
			<div class="row">
				<span class="label">Links:</span>
				<div class="links">
					{#each linkEntries as [key, name]}
						{#if nationalGroup[key]}
							<LinkWithoutIcon href={nationalGroup[key]} target="_blank" rel="noopener noreferrer">
								{name}
							</LinkWithoutIcon>
						{/if}
					{/each}
				</div>
			</div>
		{/if}

		{#if nationalGroup.notes}
			<div class="notes">{nationalGroup.notes}</div>
		{/if}
	</div>
</li>

<style>
	.national-group {
		margin-bottom: 1.5rem;
		display: flex; /* Changed to flex for horizontal layout */
		align-items: flex-start; /* Align items to the top */
		gap: 2rem; /* Space between image/name and details */
	}

	.image-and-name-container {
		display: flex;
		align-items: center;
		flex-shrink: 0; /* Prevent from shrinking */
		width: 177px; /* Reduced width for more compact image/name container */
	}

	.details-container {
		flex-grow: 1; /* Allow to take up remaining space */
		display: grid; /* Use grid for internal alignment of rows */
		grid-template-columns: 70px 1fr; /* Fixed width for label column, 1fr for content */
		column-gap: 0.25rem; /* Reduced space between label and content */
	}

	.national-group-image {
		width: 50px;
		height: 50px;
		margin-right: 0.5rem; /* Reduced space between image and name */
		object-fit: cover;
		border-radius: 60%; /* User's preferred border-radius */
	}

	.name {
		color: var(--text);
		font-family: var(--font-heading);
		font-size: 1.4rem; /* Increased font size for country name */
		font-weight: bold;
		margin: 0;
		line-height: 1.2;
		word-break: break-word;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		line-clamp: 2;
	}

	.row {
		display: contents; /* Makes children participate in parent grid */
	}

	.label {
		font-weight: 500;
		/* margin-right: 0.5rem; */ /* Removed, handled by grid column-gap */
	}

	/* Direct children of .details-container for grid placement */
	.details-container > .row > .label {
		grid-column: 1;
	}

	.details-container > .row > *:not(.label) {
		grid-column: 2;
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		row-gap: 0; /* User's preferred row-gap */
	}

	@media (max-width: 600px) {
		.national-group {
			flex-direction: column; /* Stack vertically on small screens */
		}
		.links {
			flex-direction: column;
			gap: 0.25rem;
		}
	}

	.notes {
		color: var(--text-2);
		font-size: 0.85rem;
		white-space: pre-wrap;
		overflow-wrap: break-word;
	}
</style>
