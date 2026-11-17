<script lang="ts">
	import ToolPage from '$lib/components/tools/ToolPage.svelte'
	import CollateralStudio from './CollateralStudio.svelte'
</script>

<ToolPage
	title="Collateral maker"
	description="Make on-brand PauseAI flyers, posters, event covers and social posts."
>
	{#snippet lede()}
		Make on-brand posts, flyers and event covers for PauseAI or your national group. Nothing leaves
		your browser. Just need a QR code? Use the <a href="/tools/qr">QR code generator</a>.
	{/snippet}
	<CollateralStudio />
</ToolPage>
