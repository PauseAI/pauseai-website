<script lang="ts">
	import Toggle from '$lib/components/Toggle.svelte'
	import { page } from '$app/stores'

	$: editUrl = `https://github.com/joepio/pauseai/edit/main/src/posts${$page.url.pathname}.md`
	$: if ($page.url.pathname == '/') {
		editUrl = `https://github.com/joepio/pauseai/edit/main/src/routes/%2Bpage.svelte`
	}
</script>

<a class="c2a" href="/action">Act now ></a>

<footer>
	<Toggle />
	<a href={editUrl}>Edit this page on Github</a>
	<a href="/rss.xml" target="_blank">RSS</a>
	<a href="/posts">All pages</a>
	<p>CC-BY (share alike)</p>
</footer>

<style>
	footer {
		display: flex;
		flex-direction: row;
		gap: 1rem;
		font-size: 0.7rem;
		padding-bottom: 1rem;
		margin-bottom: 1rem;
		align-items: center;
	}

	.c2a {
		color: var(--brand);
		text-transform: uppercase;
		text-decoration: none;
		font-size: 1rem;
		font-family: var(--font-heading);
	}

	a {
		color: var(--text-2);
		font-size: var(--text-xs);
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}
</style>
