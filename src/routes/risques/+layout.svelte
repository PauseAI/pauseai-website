<script lang="ts">
	export let data
	const index = data.posts.findIndex((post) => post.slug === data.url)
	const prev = data.posts[index - 1]
	const next = data.posts[index + 1]
</script>

<nav>
	{#if prev}
		<a href={prev.slug}>Previous: {prev.title}</a>
	{/if}
	{#if next}
		<a href={next.slug}>Next: {next.title}</a>
	{/if}
</nav>

<slot></slot>
