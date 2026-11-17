import { coverRect } from './text'

const MIN_ZOOM = 1
export const MAX_ZOOM = 4

interface Size {
	w: number
	h: number
}

export interface PhotoView {
	zoom: number
	focalX: number
	focalY: number
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** Move the photo by (dx, dy) canvas px, like dragging it with a finger. */
export function panPhoto(img: Size, box: Size, view: PhotoView, dx: number, dy: number): PhotoView {
	const r = coverRect(img.w, img.h, box.w, box.h, view.zoom, view.focalX, view.focalY)
	const overflowX = r.w - box.w
	const overflowY = r.h - box.h
	return {
		zoom: view.zoom,
		focalX: overflowX > 0.5 ? clamp(view.focalX - dx / overflowX, 0, 1) : view.focalX,
		focalY: overflowY > 0.5 ? clamp(view.focalY - dy / overflowY, 0, 1) : view.focalY
	}
}

/** Zoom to `zoom`, keeping the point under `anchor` (canvas px) where it is. */
export function zoomPhoto(
	img: Size,
	box: Size,
	view: PhotoView,
	zoom: number,
	anchor: { x: number; y: number }
): PhotoView {
	const next = clamp(zoom, MIN_ZOOM, MAX_ZOOM)
	const before = coverRect(img.w, img.h, box.w, box.h, view.zoom, view.focalX, view.focalY)
	const after = coverRect(img.w, img.h, box.w, box.h, next, 0, 0)
	const k = after.w / before.w
	// Image position that keeps the anchor fixed, then back to a 0..1 focal point.
	const x = anchor.x - (anchor.x - before.x) * k
	const y = anchor.y - (anchor.y - before.y) * k
	const overflowX = after.w - box.w
	const overflowY = after.h - box.h
	return {
		zoom: next,
		focalX: overflowX > 0.5 ? clamp(-x / overflowX, 0, 1) : 0.5,
		focalY: overflowY > 0.5 ? clamp(-y / overflowY, 0, 1) : 0.5
	}
}
