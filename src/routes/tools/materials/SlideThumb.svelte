<script lang="ts">
	import type { Format } from '$lib/materials/formats'
	import { slideRenderOptions, type Slide } from '$lib/materials/gallery'
	import { renderDesign } from '$lib/materials/render'
	import type { Drawable } from '$lib/materials/templates'

	interface Props {
		/** The font subsets loaded so far: drawn again when more load. */
		fontsLoaded: string | null
		slide: Slide
		format: Format
		logo: Drawable
		index: number
		active: boolean
		onSelect: () => void
	}

	const THUMB_MAX_SIDE = 160

	let { fontsLoaded, slide, format, logo, index, active, onSelect }: Props = $props()
	let canvas: HTMLCanvasElement

	$effect(() => {
		void fontsLoaded
		renderDesign(canvas, {
			...slideRenderOptions(slide, format, logo),
			maxSide: THUMB_MAX_SIDE
		})
	})
</script>

<button
	type="button"
	class="thumb"
	aria-label={`Show slide ${index + 1}`}
	aria-current={active}
	onclick={onSelect}
>
	<canvas bind:this={canvas} aria-hidden="true"></canvas>
	<span class="number">{index + 1}</span>
</button>

<style>
	.thumb {
		position: relative;
		flex: 0 0 auto;
		padding: 0.2rem;
		border: 1px solid var(--grey-300);
		border-radius: 6px;
		background-color: var(--bg);
		cursor: pointer;
	}

	.thumb[aria-current='true'] {
		border-color: var(--brand);
		box-shadow: 0 0 0 2px var(--brand);
	}

	.thumb:focus-visible {
		outline: 2px solid var(--text);
		outline-offset: 2px;
	}

	canvas {
		display: block;
		width: auto;
		height: 64px;
		border-radius: 3px;
	}

	.number {
		position: absolute;
		top: 0.2rem;
		left: 0.2rem;
		padding: 0 0.3rem;
		border-radius: 4px;
		background-color: var(--bg);
		color: var(--text);
		font-size: 0.7rem;
		font-weight: 700;
	}
</style>
