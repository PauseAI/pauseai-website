<script lang="ts">
	import Image from '$lib/components/Image.svelte'
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'
	import type { NewsItem } from '$lib/types'
	import { formatDate } from '$lib/utils'
	import NetlifyImage from './NetlifyImage.svelte'
	import Skeleton from './Skeleton.svelte'

	let isExternal: boolean
	let hasImageError = false

	export let item: NewsItem | undefined = undefined
	export let loading: boolean = false
	export let imageSizes: string | undefined = undefined
	/** Optional anchor id (e.g. for hash links from elsewhere) */
	export let id: string | undefined = undefined

	$: isExternal = item?.source === 'substack' || item?.source === 'press'

	// Reset error state if image changes
	$: if (item?.image) hasImageError = false
</script>

<div>
	<LinkWithoutIcon
		href={item?.href}
		class="news-card"
		{id}
		target={isExternal ? '_blank' : undefined}
		rel={isExternal ? 'noopener noreferrer' : undefined}
		style={loading ? 'pointer-events: none' : ''}
	>
		<div class="image-container">
			<Skeleton {loading} variant="rect" width="100%" height="100%">
				{#if item?.image && !hasImageError}
					{#if isExternal}
						<NetlifyImage
							src={item.image}
							alt={item.title}
							imgClass="image"
							sizes={imageSizes}
							onFailed={() => (hasImageError = true)}
						/>
					{:else}
						<Image src={item.image} alt={item.title} class="image" sizes={imageSizes} />
					{/if}
				{:else}
					<div class="image-placeholder"></div>
				{/if}
			</Skeleton>
		</div>
		<div class="card-content">
			{#if item?.source === 'press' && item?.outlet}
				<p class="card-outlet">{item.outlet}</p>
			{/if}
			<h3 class="card-title toc-exclude">
				<Skeleton {loading} variant="text" count={2} width="80%">
					{item?.title}
				</Skeleton>
			</h3>
			{#if loading || item?.subtitle}
				<p class="card-subtitle">
					<Skeleton {loading} variant="text" count={2} width="100%">
						{item?.subtitle}
					</Skeleton>
				</p>
			{/if}
			{#if loading || item?.date}
				<p class="card-date">
					<Skeleton {loading} variant="text" width="40%">
						{item?.date ? formatDate(item.date, 'long') : ''}
					</Skeleton>
				</p>
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

	.card-outlet {
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		margin: 0;
		color: var(--text);
		opacity: 0.7;
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
		line-clamp: 2;
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
