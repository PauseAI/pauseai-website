<script lang="ts">
	export let image: string | undefined
	export let bio: string | undefined
	export let name: string | undefined
	export let title: string | undefined

	const len = 60
	let bioOpen = false
	let bioTruncated = bio?.substring(0, len)
</script>

<li class="person">
	{#if image}
		<div class="image" style="background-image: url({image})"></div>
	{/if}
	<div class="details">
		<div class="name-title">
			<div class="name">
				{name}
			</div>
			{#if title}
				<div class="title">{title}</div>
			{/if}
		</div>
		{#if bio}
			<div class="bio">
				{bioOpen ? bio : bioTruncated}
				{#if !bioOpen && bio.length > len}
					<button on:click={() => (bioOpen = !bioOpen)}>...</button>
				{/if}
			</div>
		{/if}
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

	.image {
		display: flex;
		flex-basis: 100px;
		height: 100px;
		align-items: center;
		flex-shrink: 0;
		justify-content: center;
		border-radius: 50%;
		background-size: cover;
		background-position: center;
	}

	.name-title {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}

	.bio {
		font-style: italic;
		position: relative;
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

	.bio::before {
		content: '"';
		position: absolute;
		/* make it pretty */
		color: var(--text);
		opacity: 0.1;
		font-weight: bold;
		font-size: 4rem;
		left: -1.5rem;
		top: 1.2rem;
		line-height: 0;
		margin-right: 0.5rem;
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
