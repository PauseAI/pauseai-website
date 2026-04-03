<script lang="ts">
	import Image from '$lib/components/Image.svelte'
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'
	import type { NewsItem } from '$lib/types'
	import { formatDate } from '$lib/utils'
	import NetlifyImage from './NetlifyImage.svelte'

	let isExternal: boolean

	export let item: NewsItem
	/** Optional anchor id (e.g. for hash links from elsewhere) */
	export let id: string | undefined = undefined

	$: isExternal = item.source === 'substack' || item.source === 'press'
</script>

<div>
	<LinkWithoutIcon
		href={item.href}
		class="news-card"
		{id}
		target={isExternal ? '_blank' : undefined}
		rel={isExternal ? 'noopener noreferrer' : undefined}
	>
		<div class="image-container">
			{#if item.image}
				{#if isExternal}
					<NetlifyImage src={item.image} alt={item.title} imgClass="image" />
				{:else}
					<Image src={item.image} alt={item.title} class="image" />
				{/if}
			{:else}
				<div class="image-placeholder"></div>
			{/if}
		</div>
		<div class="card-content">
			<h3 class="card-title toc-exclude">{item.title}</h3>
			{#if item.subtitle}
				<p class="card-subtitle">{item.subtitle}</p>
			{/if}
			{#if item.date}
				<p class="card-date">{formatDate(item.date, 'long')}</p>
			{/if}
		</div>
	</LinkWithoutIcon>
</div>

<style>
	* :global(.news-card) {
		display: flex;
		flex-direction: column;
		border-radius: 12px;
		overflow: hidden;
		background: var(--bg-subtle);
		text-decoration: none;
		color: var(--text);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	* :global(.news-card:hover) {
		transform: translateY(-3px);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
		color: var(--text);
	}

	.image-container {
		width: 100%;
		aspect-ratio: 16 / 10;
		overflow: hidden;
	}

	.image-container :global(.image) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 0;
		transition: transform 0.3s ease;
	}

	* :global(.news-card:hover .image-container .image) {
		transform: scale(1.03);
	}

	.image-placeholder {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, var(--brand) 0%, hsl(32, 80%, 65%) 100%);
	}

	.card-content {
		padding: 1rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.card-title {
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: 1.1rem;
		line-height: 1.2;
		margin: 0;
		text-transform: none;
	}

	.card-subtitle {
		font-size: 0.85rem;
		font-weight: 300;
		line-height: 1.3;
		margin: 0;
		color: var(--text);
		opacity: 0.8;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-date {
		font-size: 0.8rem;
		font-weight: 300;
		margin: 0;
		color: var(--text);
		opacity: 0.6;
	}
</style>
