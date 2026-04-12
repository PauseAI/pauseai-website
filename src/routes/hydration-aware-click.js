// Intercepts clicks on specified elements before hydration.
// Sets data-waiting="true" on <html> and re-triggers the click once hydration is complete.

;(function () {
	/** @type {HTMLElement | null} */
	var clickedElement = null
	/** @type {string | null} */
	var clickedId = null

	/** @param {MouseEvent} e */
	function handleClick(e) {
		/** @type {HTMLElement | null} */
		// @ts-ignore - target is EventTarget, but we know it's an Element in this context
		var target = e.target.closest?.('[data-hydrate-click]')
		if (target) {
			clickedElement = target
			clickedId = target.id || null
			document.documentElement.setAttribute('data-waiting', 'true')
		} else if (document.documentElement.getAttribute('data-waiting') === 'true') {
			clickedElement = null
			clickedId = null
			document.documentElement.removeAttribute('data-waiting')
		}
	}

	window.addEventListener('click', handleClick, true)

	var observer = new MutationObserver(function (mutations) {
		mutations.forEach(function (mutation) {
			if (
				mutation.type === 'attributes' &&
				mutation.attributeName === 'data-waiting' &&
				document.documentElement.getAttribute('data-waiting') !== 'true'
			) {
				window.removeEventListener('click', handleClick, true)
				if (clickedElement) {
					var el = clickedId ? document.getElementById(clickedId) : clickedElement
					if (el) el.click()
					clickedElement = null
					clickedId = null
				}
				observer.disconnect()
			}
		})
	})

	observer.observe(document.documentElement, { attributes: true })
})()
