/**
 * What every collateral studio needs: the logos and canvas fonts loaded before drawing, and dragging, pinching and
 * scrolling a photo on the preview canvas. Create these while a component is being set up, as they register effects.
 */
import { onMount } from 'svelte'
import { subsetsFor } from '$lib/collateral/canvasFonts'
import { panPhoto, zoomPhoto, type PhotoView } from '$lib/collateral/photoTransform'
import { loadFonts, loadImage } from '$lib/collateral/render'
import type { Drawable } from '$lib/collateral/templates'
import { THEMES } from '$lib/collateral/themes'

/**
 * Every style's logo variant, loaded once so switching styles is instant, and the canvas fonts for the design's
 * text: Latin first, then accented, Cyrillic or Greek letters as the text gains them.
 */
export class StudioAssets {
	logos = $state.raw<Record<string, Drawable>>({})
	error = $state<string | null>(null)
	/** The font subsets loaded so far, comma-separated, or null before the first load finishes. */
	fontsLoaded = $state<string | null>(null)

	/** `faces` are the font faces to load, when not the layouts' usual ones (business cards add light weights). */
	constructor(text: () => string, faces?: { family: string; weight: string }[]) {
		onMount(() => {
			let cancelled = false
			const sources = THEMES.map((t) => t.logoSrc)
			for (const src of sources.filter((s, i) => sources.indexOf(s) === i)) {
				loadImage(src)
					.then((img) => {
						if (!cancelled) this.logos = { ...this.logos, [src]: img }
					})
					.catch(() => {
						if (!cancelled) this.error = 'Could not load the logo.'
					})
			}
			return () => {
				cancelled = true
			}
		})

		$effect(() => {
			const current = text()
			const needed = subsetsFor(current)
			const loaded = this.fontsLoaded?.split(',') ?? []
			if (this.fontsLoaded !== null && needed.every((s) => loaded.includes(s))) return
			let cancelled = false
			void loadFonts(current, faces)
				.catch(() => undefined)
				.then(() => {
					if (!cancelled)
						this.fontsLoaded = [...loaded, ...needed.filter((s) => !loaded.includes(s))].join(',')
				})
			return () => {
				cancelled = true
			}
		})
	}

	get fontsReady(): boolean {
		return this.fontsLoaded !== null
	}
}

/**
 * Drag to move the photo, pinch or scroll to zoom it, on a preview canvas. `setView` gets an updater, so fast
 * gestures never work from a stale view. Returns the canvas's pointer handlers.
 */
export function photoGestures(opts: {
	canvas: () => HTMLCanvasElement | undefined
	photo: () => Drawable | null
	view: () => PhotoView
	setView: (update: (v: PhotoView) => PhotoView) => void
}) {
	// Not state: only the gesture handlers read it.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const pointers = new Map<number, { x: number; y: number }>()
	let pinch: { dist: number; zoom: number } | null = null

	// Scroll wheel and trackpad pinch zoom the photo. Needs a non-passive listener to stop the page scrolling.
	$effect(() => {
		const canvas = opts.canvas()
		const photo = opts.photo()
		if (!canvas || !photo) return
		const img = { w: photo.width, h: photo.height }
		const onWheel = (e: WheelEvent) => {
			e.preventDefault()
			const rect = canvas.getBoundingClientRect()
			const k = canvas.width / rect.width
			const anchor = { x: (e.clientX - rect.left) * k, y: (e.clientY - rect.top) * k }
			const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
			const factor = Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.0015))
			opts.setView((v) =>
				zoomPhoto(img, { w: canvas.width, h: canvas.height }, v, v.zoom * factor, anchor)
			)
		}
		canvas.addEventListener('wheel', onWheel, { passive: false })
		return () => canvas.removeEventListener('wheel', onWheel)
	})

	function onpointerdown(e: PointerEvent & { currentTarget: HTMLCanvasElement }) {
		if (!opts.photo()) return
		e.currentTarget.setPointerCapture(e.pointerId)
		pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
		if (pointers.size === 2) {
			const [a, b] = [...pointers.values()]
			pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, zoom: opts.view().zoom }
		}
	}

	function onpointermove(e: PointerEvent & { currentTarget: HTMLCanvasElement }) {
		const canvas = e.currentTarget
		const prev = pointers.get(e.pointerId)
		const photo = opts.photo()
		if (!photo || !prev) return
		const next = { x: e.clientX, y: e.clientY }
		pointers.set(e.pointerId, next)
		const img = { w: photo.width, h: photo.height }
		const box = { w: canvas.width, h: canvas.height }
		const rect = canvas.getBoundingClientRect()
		const k = canvas.width / rect.width
		if (pointers.size === 1) {
			opts.setView((v) => panPhoto(img, box, v, (next.x - prev.x) * k, (next.y - prev.y) * k))
		} else if (pointers.size === 2 && pinch) {
			const [a, b] = [...pointers.values()]
			const mid = { x: ((a.x + b.x) / 2 - rect.left) * k, y: ((a.y + b.y) / 2 - rect.top) * k }
			const zoom = (pinch.zoom * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.dist
			opts.setView((v) => zoomPhoto(img, box, v, zoom, mid))
		}
	}

	function onpointerend(e: PointerEvent) {
		pointers.delete(e.pointerId)
		pinch = null
	}

	return { onpointerdown, onpointermove, onpointerup: onpointerend, onpointercancel: onpointerend }
}
