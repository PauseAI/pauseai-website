<script lang="ts">
	import JoinInvite from '../statement/JoinInvite.svelte'

	let heading: HTMLHeadingElement

	// Replaces the confirm button the person just pressed, so move focus here or it is lost.
	$effect(() => heading.focus())
</script>

<h1 tabindex="-1" bind:this={heading}>Your signature is confirmed</h1>
<p>Thank you for signing the PauseAI statement.</p>
<JoinInvite />

<style>
	h1:focus {
		outline: none;
	}
</style>
