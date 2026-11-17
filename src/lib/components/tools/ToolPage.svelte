<script lang="ts">
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'
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

<p class="back"><LinkWithoutIcon href="/tools">← All tools</LinkWithoutIcon></p>
<h1>{title}</h1>
<p class="lede">{@render lede()}</p>
{@render children()}

<style>
	.back {
		margin: 0 0 1rem;
		font-size: 0.875rem;
		font-weight: 700;
	}

	.back :global(a) {
		text-decoration: none;
	}

	.back :global(a:hover) {
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
