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
<div class="article-layout">
	<article>
		<slot />
	</article>
</div>

<style>
	nav {
		display: flex;
		position: sticky;
		top: 0;
		z-index: 100;
		padding: 3rem 0;
		margin-top: -1rem;
		background-color: var(--bg-subtle);
		background: linear-gradient(to bottom, var(--bg-subtle) 80%, transparent 100%);
	}

	a {
		display: flex;
		align-items: center;
		text-decoration: none;
	}

	.prev,
	.next {
		flex: 1;
	}

	.prev {
		justify-content: flex-start;
	}

	.next {
		justify-content: flex-end;
	}

	.prev :global(svg) {
		margin-right: 1rem;
	}

	.next :global(svg) {
		margin-left: 1rem;
	}

	.article-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(auto, 50rem) minmax(0, 1fr);
	}

	article {
		grid-column: 2;
		max-width: 50rem;
		margin: 0 auto;
	}
</style>
