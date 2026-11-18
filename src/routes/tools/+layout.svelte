<script lang="ts">
	import '$lib/components/tools/tools.css'
	import type { Snippet } from 'svelte'

	let { children }: { children: Snippet } = $props()
</script>

<!-- Volunteer tools: unlisted, so kept out of search results (and not in the sitemap, which lists posts only). -->
<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="tools tools-root">
	{@render children()}
</div>

<style>
	/* The tools need more room than the reading column: the preview beside the form. */
	.tools {
		--tools-width: min(64rem, 100dvw - 2 * var(--page-gutter, 1rem));
		width: var(--tools-width);
		margin-inline: calc((100% - var(--tools-width)) / 2);
	}
</style>
