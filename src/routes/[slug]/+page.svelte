<script lang="ts">
	import PostMeta from '$components/PostMeta.svelte'
	import UnderlinedTitle from '$components/UnderlinedTitle.svelte'

	import { title as siteName } from '$config'

	export let data

	const { metadata, slug, content } = data
	console.log(metadata)
	const { title = slug, date, description, image, original } = metadata
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
	{#if original}
		<footer>
			Adaptée de '<a href={original.url}>{original.title}</a>' par PauseAI, sous
			<a href="https://creativecommons.org/licenses/by/4.0/deed.fr">licence CC BY 4.0</a>.
		</footer>
	{/if}
</article>

<style>
	article {
		max-inline-size: 50rem;
		margin-inline: auto;
		margin-top: 3rem;
	}
	footer {
		color: #535353;
		font-size: 0.8rem;
		margin-top: 4rem;
	}
</style>
