<script lang="ts">
	export let title: string
	export let description: string
	export let date: string
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:type" content="article" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="article:published_time" content={date} />
</svelte:head>
