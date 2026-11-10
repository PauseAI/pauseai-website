<script lang="ts">
	import Link from '$lib/components/Link.svelte'

	/** In the chapter-site iframe, where a link must not replace the form. */
	let { embedded = false }: { embedded?: boolean } = $props()
</script>

<!-- Shown to everyone, as saying it only to non-members would reveal who is a member. -->
<p class="invite">
	Want to do more? <Link href="/join" target={embedded ? '_blank' : null}>Join PauseAI</Link>
</p>

<style>
	.invite {
		font-weight: bold;
	}
</style>
