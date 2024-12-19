<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'

	// don't destructure to maintain reactivity for invalidation after language detection
	export let data
	$: meta = data.meta

	const parent = data.slug.split('/').slice(0, -1).join('/')
</script>

<PostMeta title={meta.title} description={meta.description} date={meta.date} image={meta.image} />

<article>
	{#if parent}
		<a href={`/${parent}`}>View all {parent}</a>
	{/if}
	<hgroup>
		<h1>{meta.title}</h1>
		{#if meta.date}
			<!-- <p>Published at {formatDate(date)}</p> -->
		{/if}
	</hgroup>

	<div class="tags">
		{#if meta.categories && meta.categories.length > 0}
			<div class="categories">
				{#each meta.categories as category}
					<span class="surface-4">&num;{category}</span>
				{/each}
			</div>
		{/if}
	</div>

	<div class="prose">
		<svelte:component this={data.content} />
	</div>
</article>

<style>
	article {
		max-inline-size: var(--size-content-3);
		margin-inline: auto;
	}

	h1 {
		text-transform: capitalize;
	}

	h1 + p {
		margin-top: var(--size-2);
		color: var(--text-2);
	}

	.tags {
		display: flex;
		gap: var(--size-3);
		margin-top: var(--size-7);
	}

	.tags > * {
		padding: var(--size-2) var(--size-3);
		border-radius: var(--radius-round);
	}
</style>
