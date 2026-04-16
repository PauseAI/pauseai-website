<script lang="ts">
	import Card from './Card.svelte'

	/** Notion embed URL (required) */
	export let src: string

	/** Initial iframe height in pixels */
	export let height = 600

	/** Optional title for accessibility */
	export let title: string | undefined = undefined
</script>

<Card className="notion-embed-card">
	<iframe
		{src}
		width="100%"
		{height}
		frameborder="0"
		marginheight="0"
		marginwidth="0"
		{title}
		allowfullscreen
		style="width: 100%; height: {height}px; border: 0;"
		sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation"
	></iframe>
</Card>
