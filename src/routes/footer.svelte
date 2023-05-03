<script lang="ts">
	import Toggle from '$lib/components/Toggle.svelte'
</script>

<footer>
	<p>CC-BY</p>
	<a href="https://github.com/joepio/pauseai">Source code on Github</a>
	<a href="/rss.xml" target="_blank">RSS</a>
	<Toggle />
</footer>

<style>
	footer {
		padding-block: var(--size-7);
		border-top: 1px solid var(--border);
	}

	p {
		color: var(--text-2);
	}
</style>
