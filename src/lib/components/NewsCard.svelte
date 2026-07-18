<script lang="ts">
	import Image from '$lib/components/Image.svelte'
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'
	import type { NewsItem } from '$lib/types'
	import { formatDate } from '$lib/utils'
	import NetlifyImage from './NetlifyImage.svelte'
	import Skeleton from './Skeleton.svelte'

	interface Props {
		item?: NewsItem
		loading?: boolean
		/**
		 * Passed by the parent layout so responsive images download a variant close to the
		 * card's rendered width instead of the image component's broad default.
		 */
		imageSizes?: string
		id?: string
	}

	let { item, loading = false, imageSizes, id }: Props = $props()

	let isExternal = $derived(item?.source === 'substack' || item?.source === 'press')
	let hasImageError = $state(false)

	// Reset error state when item changes and new item has image
	$effect(() => {
		if (item?.image) hasImageError = false
	})
</script>

<div class="news-card-wrapper">
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
							imgClass="image image-contain"
							sizes={imageSizes}
							onFailed={() => (hasImageError = true)}
						/>
					{:else}
						<Image
							src={item.image}
							alt={item.title}
							class="image image-cover"
							sizes={imageSizes}
							aspectRatio={1200 / 628}
						/>
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
					<span class="card-title-text">{item?.title}</span>
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
	.news-card-wrapper {
		display: flex;
	}

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
		width: 100%;
	}

	* :global(.news-card:hover) {
		transform: translateY(-3px);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
		color: var(--text);
	}

	.image-container {
		width: 100%;
		/* Match the 1200/628 post-banner crop so curated banner images fill the
		   card the same way they frame the post header. */
		aspect-ratio: 1200 / 628;
		overflow: hidden;
		background: var(--bg-subtle);
	}

	.image-container :global(.image) {
		width: 100%;
		height: 100%;
		border-radius: 0;
		transition: transform 0.3s ease;
	}

	/* Internal post images are curated to frame well at the banner ratio, so
	   cover-crop them. Substack/press images are arbitrary shapes we don't
	   control, so contain them to avoid cutting off charts, posters, etc. */
	.image-container :global(.image-cover) {
		object-fit: cover;
	}

	.image-container :global(.image-contain) {
		object-fit: contain;
	}

	/* Only zoom cover-cropped (internal) images on hover. Zooming a contained
	   image would re-crop it under the container's overflow:hidden, defeating
	   the point of showing it in full. */
	* :global(.news-card:hover .image-container .image-cover) {
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
		flex: 1 1 auto;
	}

	.card-title {
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: 1.1rem;
		line-height: 1.2;
		margin: 0;
		text-transform: none;
		/* Reserve a fixed two-line area and center the title within it, so every
		   card's subtitle starts at the same height regardless of title length,
		   and short one-line titles don't leave a gap above the subtitle. */
		min-height: calc(1.1rem * 1.2 * 2);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	/* Clamp lives on the inner element because -webkit-line-clamp needs
	   display: -webkit-box, which can't coexist with the flex centering above. */
	.card-title-text {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
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
		margin-top: auto;
		color: var(--text);
		opacity: 0.6;
	}
</style>
