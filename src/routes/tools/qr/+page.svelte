<script lang="ts">
	import ToolPage from '$lib/components/tools/ToolPage.svelte'
	import QrGenerator from './QrGenerator.svelte'
</script>

<ToolPage title="QR code generator" description="Make a PauseAI QR code for any web address.">
	{#snippet lede()}
		Make a QR code for any web address, with the PauseAI pause symbol in the middle. Nothing leaves
		your browser.
	{/snippet}
	<QrGenerator />
</ToolPage>
