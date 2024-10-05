<script lang="ts">
	import { url, title as siteName } from '$lib/config'
	export let title: string
	export let description: string
	export let date: string | undefined = undefined
	/** URL or relative path to cover / preview image */
	export let image = '/Cover.jpg'
	const imageUrl = image.startsWith('/') ? `${url}${image}` : image

	const schemaOrgMarkup = {
		'@context': 'https://schema.org/',
		'@type': 'BlogPosting',
		headline: title,
		abstract: description,
		datePublished: date,
		image: {
			'@type': 'ImageObject',
			url: imageUrl
		}
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:site_name" content={siteName} />
	{#if date}
		<meta property="article:published_time" content={date} />
	{/if}
	<meta property="twitter:title" content={title} />
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:image" content={imageUrl} />
	<meta property="twitter:description" content={description} />
	<meta property="twitter:site" content="@PauseAI" />
	<meta property="twitter:creator" content="@PauseAI" />
	{@html `<script type="application/ld+json">
        ${JSON.stringify(schemaOrgMarkup)}
    </script>`}
</svelte:head>

<div style="display: none;" data-pagefind-index-attrs="data-content" data-content={description} />
