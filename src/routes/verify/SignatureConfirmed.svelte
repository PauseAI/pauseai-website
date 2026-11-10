<script lang="ts">
	import Link from '$lib/components/Link.svelte'
</script>

<h1>Your signature is confirmed</h1>
<p>Thank you for signing the PauseAI statement.</p>
<!-- Shown to everyone, as saying it only to non-members would reveal who is a member. -->
<p class="invite">Want to do more? <Link href="/join">Join PauseAI</Link></p>

<style>
	.invite {
		font-weight: bold;
	}
</style>
