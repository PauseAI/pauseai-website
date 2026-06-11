<script lang="ts">
	import type { Picture } from '$lib/types'
	import { layoutWidth } from '$lib/config'

	interface Props {
		src: string
		alt?: string | null
		title?: string | null
		sizes?: string | null
		class?: string
	}

	let {
		src,
		alt = null,
		title = null,
		sizes = `min(${layoutWidth}, 100vw)`,
		class: className = ''
	}: Props = $props()

	// Use import.meta.glob to statically analyze all potential static assets
	const pictureModules = import.meta.glob<Picture>(
		'../../assets/images/**/*.{avif,heif,gif,jpeg,jpg,png,tiff,webp}',
		{
			eager: true,
			import: 'default',
			query: {
				enhanced: true,
				w: '520;640;800;1280;1920;2560;3840'
			}
		}
	)
	const assetUrlModules = import.meta.glob<string>('../../assets/images/**/*', {
		eager: true,
		import: 'default',
		query: { url: true }
	})

	let fullPath = $derived(src.startsWith('/') ? `../../assets/images${src}` : null)
	let picture: Picture | null = $derived(pictureModules[fullPath ?? ''] ?? null)
	let assetUrl: string | null = $derived(assetUrlModules[fullPath ?? ''] ?? null)
</script>

{#if picture}
	<enhanced:img src={picture} {alt} class="enhanced {className}" loading="lazy" {sizes} {title}
	></enhanced:img>
{:else if assetUrl}
	<img src={assetUrl} {alt} {title} loading="lazy" class={className} />
{:else}
	<img {src} {alt} {title} loading="lazy" class={className} />
{/if}

<style>
	.enhanced {
		height: auto;
	}
</style>
