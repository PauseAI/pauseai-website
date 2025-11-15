<script lang="ts">
	import { title as siteName, url as rootUrl } from '$lib/config'
	import type { BlogPosting, WithContext } from 'schema-dts'
	import { page } from '$app/stores'
	import { deLocalizeHref } from '$lib/paraglide/runtime'

	export let title: string
	export let description: string
	export let date: string | undefined = undefined
	/** URL or relative path to cover / preview image */
	export let image = '/Cover.jpg'
	/** Canonical URL for this page (og:url) */
	export let pageUrl: string = `${rootUrl}${deLocalizeHref($page.url.pathname)}`
	/** Alt text for the image (og:image:alt) */
	export let imageAlt: string | undefined = undefined

	const imageUrl = image.startsWith('/') ? `${rootUrl}${image}` : image

	const schemaOrgMarkup: WithContext<BlogPosting> = {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: title,
		abstract: description,
		datePublished: date,
		image: {
			'@type': 'ImageObject',
			url: imageUrl
		},
		publisher: {
			'@type': 'Organization',
			name: siteName,
			url: rootUrl
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
	{#if imageAlt}
		<meta property="og:image:alt" content={imageAlt} />
	{/if}
	{#if pageUrl}
		<meta property="og:url" content={pageUrl} />
	{/if}
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
	<!-- eslint-disable-next-line svelte/no-at-html-tags (static content) @typescript-eslint/no-unused-expressions (false positive) -->
	{@html '<script type="application/ld+json">' + JSON.stringify(schemaOrgMarkup) + '</script>'}
</svelte:head>

<div style="display: none;" data-pagefind-index-attrs="data-content" data-content={description} />
