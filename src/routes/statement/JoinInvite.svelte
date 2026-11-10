<script lang="ts">
	import Link from '$lib/components/Link.svelte'

	/** In the chapter-site iframe, where a link must not replace the form. */
	let { embedded = false }: { embedded?: boolean } = $props()
</script>

<!-- Shown to everyone, as saying it only to non-members would reveal who is a member. -->
<span class="join">
	<Link href="/join" target={embedded ? '_blank' : null}>Join PauseAI</Link>
</span>

<style>
	.join :global(a) {
		display: inline-block;
		padding: 0.55rem 1.4rem;
		color: white;
		font-weight: bold;
		text-decoration: none;
		white-space: nowrap;
		background-color: var(--brand);
		border-radius: 50px;
		transition: opacity 0.2s;
	}

	.join :global(a:hover) {
		opacity: 0.9;
	}
</style>
