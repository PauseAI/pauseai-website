<script lang="ts">
	import type { NationalGroup } from '$lib/types'

	export let nationalGroup: NationalGroup
</script>

<li class="national-group">
	<div class="name">
		{nationalGroup.name}
	</div>

	<div class="content">
		<div class="info-section">
			{#if nationalGroup.leader !== 'No'}
				<span class="detail-item">
					<span class="label">Leader:</span>
					{#if nationalGroup.email}
						<a href="mailto:{nationalGroup.email}" class="link">{nationalGroup.leader}</a>
					{:else}
						<span>{nationalGroup.leader}</span>
					{/if}
				</span>
			{/if}
		</div>

		{#if nationalGroup.website || nationalGroup.xLink || nationalGroup.discordLink || nationalGroup.whatsappLink}
			<div class="social-links">
				<span class="label">Links:</span>
				{#if nationalGroup.website}
					<a href={nationalGroup.website} class="link" target="_blank" rel="noopener noreferrer"
						>Website</a
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
		{/if}
	</div>

	{#if nationalGroup.notes}
		<div class="notes">
			{nationalGroup.notes}
		</div>
	{/if}
</li>

<style>
	.national-group {
		display: flex;
		flex-direction: column;
		padding: 0;
		margin-bottom: 0.5rem;
		background-color: transparent;
	}

	.name {
		color: var(--text);
		font-family: var(--font-heading);
		font-weight: bold;
		font-size: 1.2rem;
		margin: 0 0 0.2rem 0;
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		font-size: 0.85rem;
	}

	.info-section {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
	}

	.detail-item {
		display: inline-flex;
		align-items: baseline;
	}

	.label {
		font-weight: 500;
		margin-right: 0.25rem;
	}

	.notes {
		white-space: pre-wrap;
		overflow-wrap: break-word;
		margin: 0.25rem 0 0 0;
		color: var(--text-2);
		font-size: 0.85rem;
	}

	.link {
		color: #f90;
		text-decoration: none;
	}

	.link:hover {
		text-decoration: underline;
	}

	.social-links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
</style>
