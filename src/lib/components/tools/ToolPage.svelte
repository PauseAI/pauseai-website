<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import type { Snippet } from 'svelte'

	interface Props {
		title: string
		/** For the page's meta description. */
		description: string
		/** The line under the title. */
		lede: Snippet
		children: Snippet
	}

	let { title, description, lede, children }: Props = $props()
</script>

<PostMeta {title} {description} />

<a href="/tools" class="back">← All tools</a>
<h1>{title}</h1>
<p class="lede">{@render lede()}</p>
{@render children()}

<style>
	.back {
		display: inline-block;
		margin-bottom: 1rem;
		font-size: 0.875rem;
		font-weight: 700;
		text-decoration: none;
	}

	.back:hover {
		text-decoration: underline;
	}

	h1 {
		margin: 0 0 0.5rem;
	}

	.lede {
		max-width: 60ch;
		margin: 0 0 2rem;
		color: var(--text-2);
	}
</style>
