/**
 * Reports `el`'s rendered height to the host page whenever it may have changed, for an
 * embed whose host sizes its iframe to the reported height.
 *
 * A ResizeObserver alone is not enough. Chrome skips rendering work for a cross-origin
 * iframe that is off-screen, and ResizeObserver callbacks run in that rendering step, so
 * content that grows while the embed is below the fold goes unreported until it is
 * scrolled into view: the host reserves too little, then jumps when the visitor reaches
 * it. Mutations, load events and timers are not paused, and measuring forces layout even
 * while rendering is throttled, so those triggers keep the reported height current.
 *
 * Returns a cleanup function.
 */
export function reportEmbedHeight(el: HTMLElement, send: (height: number) => void): () => void {
	let last = -1
	const post = () => {
		// Ceil the subpixel height: 234.4px reported as 234 would leave the host's iframe
		// 0.4px short and show a scrollbar.
		const height = Math.ceil(el.getBoundingClientRect().height)
		if (height === last) return
		last = height
		send(height)
	}

	const resizeObserver = new ResizeObserver(post)
	resizeObserver.observe(el)

	const mutationObserver = new MutationObserver(post)
	mutationObserver.observe(el, {
		childList: true,
		subtree: true,
		attributes: true,
		characterData: true
	})

	// Images and other subresources change size without a DOM mutation. `load` does not
	// bubble, so listen in the capture phase.
	el.addEventListener('load', post, true)
	window.addEventListener('load', post)
	void document.fonts?.ready.then(post)

	post()
	return () => {
		resizeObserver.disconnect()
		mutationObserver.disconnect()
		el.removeEventListener('load', post, true)
		window.removeEventListener('load', post)
	}
}
