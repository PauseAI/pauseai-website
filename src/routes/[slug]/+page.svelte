<script lang="ts">
	import Image from '$lib/components/Image.svelte'
	import Link from '$lib/components/Link.svelte'
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
		<Link href={`/${parent}`}>View all {parent}</Link>
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

	{#if imageUrl}
		<div class="banner">
			<Image src={imageUrl} alt={title} />
		</div>
	{/if}

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

	.banner {
		margin: 1.5rem 0 2rem;
		border-radius: 12px;
		overflow: hidden;
	}

	.banner :global(img) {
		width: 100%;
		max-height: 400px;
		object-fit: cover;
		display: block;
	}

	/* h1 + p {
		margin-top: var(--size-2);
		color: var(--text-2);
	} */

	/*.tags {
		display: flex;
		gap: var(--size-3);
		margin-top: var(--size-7);
	}

	.tags > * {
		padding: var(--size-2) var(--size-3);
		border-radius: var(--radius-round);
	}*/
</style>
