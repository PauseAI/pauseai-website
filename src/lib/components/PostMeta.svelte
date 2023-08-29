<script lang="ts">
	export let title: string
	export let description: string
	export let date: string
	/** URL or relative path to cover / preview image */
	export let image: string = '/cover.png'
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:type" content="article" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={image} />
	<meta property="article:published_time" content={date} />
	<meta property="twitter:title" content={title} />
	<meta property="twitter:card" content="summary" />
	<meta property="twitter:image" content={image} />
	<meta property="twitter:description" content={description} />
	<meta property="twitter:site" content="@PauseAI" />
	<meta property="twitter:creator" content="@PauseAI" />
</svelte:head>
