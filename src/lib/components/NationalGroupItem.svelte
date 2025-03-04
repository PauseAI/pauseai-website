<script lang="ts">
	import type { NationalGroup } from '$lib/types'

	export let nationalGroup: NationalGroup
</script>

<li class="national-group">
	<div class="name">
		{nationalGroup.name}
	</div>

	{#if nationalGroup.notes}
		<div class="notes">
			{nationalGroup.notes}
		</div>
	{/if}

	<div class="details">
		{#if nationalGroup.leader !== 'No'}
			<div class="info-row">
				<span class="label">Leader:</span>
				{#if nationalGroup.email}
					<a href="mailto:{nationalGroup.email}" class="link">{nationalGroup.leader}</a>
				{:else}
					<span>{nationalGroup.leader}</span>
				{/if}
			</div>
		{/if}

		{#if nationalGroup.legalEntity}
			<div class="info-row">
				<span class="label">Legal entity:</span> Yes
			</div>
		{/if}

		{#if nationalGroup.website || nationalGroup.xLink || nationalGroup.discordLink || nationalGroup.whatsappLink}
			<div class="links">
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
</li>

<style>
	.national-group {
		display: flex;
		flex-direction: column;
		position: relative;
		padding: 0;
		margin-bottom: 1rem;
		border-radius: 0;
		background-color: transparent;
		box-shadow: none;
	}

	.name {
		color: var(--text);
		font-family: var(--font-heading);
		font-weight: bold;
		font-size: 1.3rem;
		margin: 0 0 0.5rem 0;
	}

	.notes {
		white-space: pre-wrap;
		overflow-wrap: break-word;
		margin: 0.5rem 0;
		color: var(--text-2);
		font-size: 0.9rem;
	}

	.info-row {
		display: flex;
		align-items: baseline;
		margin-bottom: 0.25rem;
		font-size: 0.9rem;
	}

	.label {
		font-weight: 500;
		margin-right: 0.5rem;
	}

	.link {
		color: #f90;
		text-decoration: none;
	}

	.link:hover {
		text-decoration: underline;
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin: 0.5rem 0 0 0;
		font-size: 0.9rem;
	}

	.details {
		margin-top: 0.5rem;
	}
</style>
