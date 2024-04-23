<script lang="ts">
	export let description: string | undefined
	export let name: string | undefined
	export let lead: string | undefined

	const len = 60
	let bioOpen = false
	let bioTruncated = description?.substring(0, len)
</script>

<li class="person">
	<div class="details">
		<div class="name-title">
			<div class="name">
				{name}
			</div>
		</div>
		{#if description}
			<div class="bio">
				{bioOpen ? description : bioTruncated}
				{#if !bioOpen && description.length > len}
					<button on:click={() => (bioOpen = !bioOpen)}>...</button>
				{/if}
			</div>
		{/if}
		<div class="lead">{lead}</div>
	</div>
</li>

<style>
	.person {
		display: flex;
		gap: 1rem;
	}

	.details {
		flex-shrink: 1;
	}

	.name-title {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}

	.bio {
		position: relative;
		/* /* show all formatting, like newlines */
		white-space: pre-wrap;
		overflow-wrap: break-word;
		word-wrap: break-word;
		font-size: 0.9rem;
	}

	.bio button {
		background: none;
		border: none;
		color: var(--brand);
		cursor: pointer;
		text-decoration: underline;
		font-size: 0.9rem;
		margin-left: -0.5rem;
	}

	.bio button:hover {
		color: var(--brand-dark);
		background-color: var(--bg-subtle);
		border-radius: 6px;
	}

	.name {
		color: var(--text);
		font-family: var(--font-heading);
		font-weight: bold;
		text-decoration: none;
		font-size: 1.4rem;
		text-transform: capitalize;
		margin: 0;
	}

	.title {
		font-weight: normal;
		font-family: var(--font-body);
		font-size: 1rem;
	}
</style>
