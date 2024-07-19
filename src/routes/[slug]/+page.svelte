<script lang="ts">
	import PostMeta from '$components/PostMeta.svelte'
	import UnderlinedTitle from '$components/UnderlinedTitle.svelte'

	export let data

	const { meta, slug, content } = data
	const { title = slug, date, categories, description, image } = meta
	const parent = slug.split('/').slice(0, -1).join('/')
</script>

<PostMeta {title} {description} {date} {image} />

<article>
	<hgroup>
		<UnderlinedTitle>{title}</UnderlinedTitle>
		{#if date}
			<!-- <p>Published at {formatDate(date)}</p> -->
		{/if}
	</hgroup>

	<div class="prose">
		<svelte:component this={content} />
	</div>
</article>

<style>
	article {
		max-inline-size: 50rem;
		margin-inline: auto;
		margin-top: 3rem;
	}
</style>
