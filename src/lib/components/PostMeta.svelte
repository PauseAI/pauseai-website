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
	<meta property="article:published_time" content={date} />
	<meta property="og:image" content={image} />
</svelte:head>
