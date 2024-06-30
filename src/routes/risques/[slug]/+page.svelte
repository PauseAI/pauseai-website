<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import UnderlinedTitle from '$lib/components/UnderlinedTitle.svelte'

	export let data

	const { meta, slug, content } = data
	const { title = slug, date, categories, description, image } = meta
</script>

<PostMeta {title} {description} {date} {image} />

<hgroup>
	<UnderlinedTitle>{title}</UnderlinedTitle>
	{#if date}
		<!-- <p>Published at {formatDate(date)}</p> -->
	{/if}
</hgroup>

<div class="prose">
	<svelte:component this={content} />
</div>
