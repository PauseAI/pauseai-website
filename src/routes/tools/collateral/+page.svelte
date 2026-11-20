<script lang="ts">
	import Link from '$lib/components/Link.svelte'
	import ToolPage from '$lib/components/tools/ToolPage.svelte'
	import CollateralApp from './CollateralApp.svelte'
</script>

<ToolPage
	title="Materials maker"
	description="Make on-brand PauseAI flyers, posters, business cards, event covers and social posts."
>
	{#snippet lede()}
		Make on-brand posts, flyers, business cards and event covers for PauseAI or your national group.
		Nothing leaves your browser. Just need a QR code? Use the <Link href="/tools/qr"
			>QR code generator</Link
		>.
	{/snippet}
	<CollateralApp />
</ToolPage>
