<script lang="ts">
	import PostMeta from '$components/PostMeta.svelte'
	import UnderlinedTitle from '$components/UnderlinedTitle.svelte'

	import { title as siteName } from '$config'

	export let data

	const { metadata, slug, content } = data
	const { title = slug, date, description, image } = metadata
	// const parent = slug.split('/').slice(0, -1).join('/')
</script>

<PostMeta title={`${title} | ${siteName}`} {description} {date} {image} />

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
