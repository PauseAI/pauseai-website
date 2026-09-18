import type { Action } from 'svelte/action'

/**
 * Sizes a srcdoc iframe to the email it holds, instead of a fixed height that leaves a
 * blank gap under a short email. srcdoc frames are same-origin, so the content can be
 * measured. Re-measures when images load and when the frame's width changes.
 */
export const fitFrame: Action<HTMLIFrameElement> = (frame) => {
	function measure() {
		// Null while a new srcdoc is still loading; the load event measures it once it's there.
		const root = frame.contentDocument?.documentElement
		if (!root) return
		// scrollHeight can't fall below the frame's own height, so a frame left tall by a
		// longer email would keep that height forever. Collapse it first, then measure.
		frame.style.height = '0px'
		frame.style.height = `${Math.max(240, root.scrollHeight)}px`
	}

	function onLoad() {
		measure()
		for (const img of Array.from(frame.contentDocument?.images ?? [])) {
			if (!img.complete) img.addEventListener('load', measure, { once: true })
		}
	}

	// Width only: measure() itself changes the height, so reacting to that would loop.
	let width = 0
	const observer = new ResizeObserver(([entry]) => {
		if (entry.contentRect.width === width) return
		width = entry.contentRect.width
		measure()
	})

	frame.addEventListener('load', onLoad)
	observer.observe(frame)
	return {
		destroy() {
			frame.removeEventListener('load', onLoad)
			observer.disconnect()
		}
	}
}
