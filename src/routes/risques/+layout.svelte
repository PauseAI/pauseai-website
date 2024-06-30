<script lang="ts">
	import MoveLeftIcon from '$lib/components/icons/move-left.svelte'
	import MoveRightIcon from '$lib/components/icons/move-right.svelte'
	export let data
	const index = data.posts.findIndex((post) => post.slug === data.url)
	const prev = data.posts[index - 1]
	const next = data.posts[index + 1]
</script>

<nav>
	{#if prev}
		<a href={prev.slug} class="prev"><MoveLeftIcon />{prev.title}</a>
	{/if}
	{#if next}
		<a href={next.slug} class="next">{next.title}<MoveRightIcon /></a>
	{/if}
</nav>

<slot></slot>

<style>
</style>
