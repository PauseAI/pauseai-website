<script lang="ts">
	import type { NationalGroup, NationalGroupLink } from '$lib/types'
	import { typedEntries } from '$lib/utils'

	export let nationalGroup: NationalGroup

	const nationalGroupLinkNames: Record<NationalGroupLink, string> = {
		website: 'Website',
		linktreeLink: 'Linktree',
		instagramLink: 'Instagram',
		tiktokLink: 'TikTok',
		xLink: 'X',
		discordLink: 'Discord',
		whatsappLink: 'WhatsApp'
	}

	const linkEntries = typedEntries(nationalGroupLinkNames)
</script>

<li class="national-group">
	<h3 class="name">{nationalGroup.name}</h3>

	{#if nationalGroup.leader !== 'No'}
		<div class="row">
			<span class="label">Leader:</span>
			{#if nationalGroup.email}
				<a href="mailto:{nationalGroup.email}" class="link">{nationalGroup.leader}</a>
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
						<a href={nationalGroup[key]} class="link" target="_blank" rel="noopener noreferrer"
							>{name}</a
						>
					{/if}
				{/each}
			</div>
		</div>
	{/if}

	{#if nationalGroup.notes}
		<div class="notes">{nationalGroup.notes}</div>
	{/if}
</li>

<style>
	.national-group {
		margin-bottom: 1.5rem;
	}

	.name {
		color: var(--text);
		font-family: var(--font-heading);
		font-size: 1.2rem;
		font-weight: bold;
		margin: 0 0 0.5rem;
	}

	.row {
		display: flex;
		align-items: baseline;
		margin-bottom: 0.5rem;
		font-size: 0.85rem;
	}

	.label {
		font-weight: 500;
		margin-right: 0.5rem;
		min-width: 3.5rem;
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.notes {
		color: var(--text-2);
		font-size: 0.85rem;
		white-space: pre-wrap;
		overflow-wrap: break-word;
	}

	.link {
		color: #f90;
		text-decoration: none;
	}

	.link:hover {
		text-decoration: underline;
	}
</style>
