<script lang="ts">
	export let data
	const { props } = data
</script>

<section data-pagefind-ignore>
	{#if props.length === 0}
		<p>No team members found</p>
	{/if}
	<ul class="people">
		{#each props as { name, image, bio, title }}
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
						<div class="bio">{bio}</div>
					{/if}
				</div>
			</li>
		{/each}
	</ul>
</section>

<style>
	.people {
		display: grid;
		gap: 1rem;
	}

	.person {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.image {
		width: 100px;
		height: 100px;
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
