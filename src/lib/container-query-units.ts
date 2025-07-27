export function emulateCqwIfNeeded(element: HTMLElement) {
	if (CSS.supports('container-type: inline-size')) return
	const observer = initializeCqwResizeObserver(element)
	return () => observer.disconnect()
}

export function initializeCqwResizeObserver(element: HTMLElement) {
	const resizeObserver = new ResizeObserver((entries) => {
		for (const entry of entries) {
			const width = entry.contentRect.width
			element.style.setProperty('--cqw', width / 100 + 'px')
		}
	})
	resizeObserver.observe(element)
	return resizeObserver
}
