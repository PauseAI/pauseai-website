<script lang="ts">
	import Toggle from '$lib/components/Toggle.svelte'
</script>

<footer>
	<Toggle />
	<a href="https://github.com/joepio/pauseai">Source code on Github</a>
	<a href="/rss.xml" target="_blank">RSS</a>
	<p>CC-BY</p>
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

	a {
		color: var(--text-2);
		font-size: var(--text-xs);
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}
</style>
