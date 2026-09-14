<!--
	/close — Stripe success redirect target.

	When a volunteer opts in to becoming a paying member, the onboarding flow
	opens Stripe in a new tab via `window.open()`. Stripe's success URL is
	configured to redirect here. Because the tab was script-opened, `window.close()`
	can close it automatically. If the user navigated here manually (or the
	browser blocks the close), a fallback message is shown.
-->
<script lang="ts">
	import { onMount } from 'svelte'

	onMount(() => {
		window.close()
	})
</script>

<svelte:head>
	<title>Done — PauseAI</title>
</svelte:head>

<h1>✓ Thanks for your donation!</h1>
<p>You can close this tab now.</p>
