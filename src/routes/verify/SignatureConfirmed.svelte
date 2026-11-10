<script lang="ts">
	import Link from '$lib/components/Link.svelte'

	let heading: HTMLHeadingElement

	// Replaces the confirm button the person just pressed, so move focus here or it is lost.
	$effect(() => heading.focus())
</script>

<h1 tabindex="-1" bind:this={heading}>Your signature is confirmed</h1>
<p>Thank you for signing the PauseAI statement.</p>
<!-- Shown to everyone, as saying it only to non-members would reveal who is a member. -->
<p class="invite">Want to do more? <Link href="/join">Join PauseAI</Link></p>

<style>
	h1:focus {
		outline: none;
	}

	.invite {
		font-weight: bold;
	}
</style>
