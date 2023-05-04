<script lang="ts">
	import { formatDate } from '$lib/utils'

	export let data

	let title = data.meta.title || data.slug
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:type" content="article" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={data.meta.description} />
</svelte:head>

<article>
	<hgroup>
		<h1>{title}</h1>
		{#if data.meta.date}
			<!-- <p>Published at {formatDate(data.meta.date)}</p> -->
		{/if}
	</hgroup>

	<div class="tags">
		{#if data.meta.categories && data.meta.categories.length > 0}
			<div class="categories">
				{#each data.meta.categories as category}
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
