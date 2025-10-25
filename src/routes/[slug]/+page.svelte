<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { getAssetUrlOrStaticUrl } from '$lib/images.js'

	// don't destructure to maintain reactivity for invalidation after language detection
	export let data
	$: meta = data.meta
	$: ({ title = data.slug, date, description, image, author } = meta)
	$: parent = data.slug.split('/').slice(0, -1).join('/')
	$: imageUrl = getAssetUrlOrStaticUrl(image)
</script>

<PostMeta {title} {description} {date} image={imageUrl} />

<article>
	{#if parent}
		<a href={`/${parent}`}>View all {parent}</a>
	{/if}
	<hgroup>
		<h1>{title}</h1>
		{#if author}
			<p>{author}</p>
		{/if}
		{#if date}
			<!-- <p>Published at {formatDate(date)}</p> -->
		{/if}
	</hgroup>

	<!-- <div class="tags">
		{#if meta.categories && meta.categories.length > 0}
			<div class="categories">
				{#each meta.categories as category}
					<span class="surface-4">&num;{category}</span>
				{/each}
			</div>
		{/if}
	</div> -->

	<div class="prose">
		<svelte:component this={data.content} />
	</div>
</article>

<style>
	article {
		max-inline-size: var(--size-content-3);
		margin-inline: auto;
	}
</style>
