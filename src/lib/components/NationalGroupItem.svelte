<script lang="ts">
	import type { NationalGroup } from '$lib/types'

	export let nationalGroup: NationalGroup
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

	{#if nationalGroup.website || nationalGroup.xLink || nationalGroup.discordLink || nationalGroup.whatsappLink || nationalGroup.linktreeLink || nationalGroup.instagramLink || nationalGroup.tiktokLink}
		<div class="row">
			<span class="label">Links:</span>
			<div class="links">
				{#if nationalGroup.website}
					<a href={nationalGroup.website} class="link" target="_blank" rel="noopener noreferrer"
						>Website</a
					>
				{/if}
				{#if nationalGroup.linktreeLink}
					<a
						href={nationalGroup.linktreeLink}
						class="link"
						target="_blank"
						rel="noopener noreferrer">Linktree</a
					>
				{/if}
				{#if nationalGroup.instagramLink}
					<a
						href={nationalGroup.instagramLink}
						class="link"
						target="_blank"
						rel="noopener noreferrer">Instagram</a
					>
				{/if}
				{#if nationalGroup.tiktokLink}
					<a href={nationalGroup.tiktokLink} class="link" target="_blank" rel="noopener noreferrer"
						>TikTok</a
					>
				{/if}
				{#if nationalGroup.xLink}
					<a href={nationalGroup.xLink} class="link" target="_blank" rel="noopener noreferrer">X</a>
				{/if}
				{#if nationalGroup.discordLink}
					<a href={nationalGroup.discordLink} class="link" target="_blank" rel="noopener noreferrer"
						>Discord</a
					>
				{/if}
				{#if nationalGroup.whatsappLink}
					<a
						href={nationalGroup.whatsappLink}
						class="link"
						target="_blank"
						rel="noopener noreferrer">WhatsApp</a
					>
				{/if}
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
