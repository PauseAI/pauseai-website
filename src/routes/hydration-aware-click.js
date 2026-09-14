// Intercepts clicks on specified elements before hydration.
// Sets data-waiting="true" on <html> and re-triggers the click once hydration is complete.

;(function () {
	/** @type {HTMLElement | null} */
	var clickedElement = null
	/** @type {string | null} */
	var clickedId = null

	/** @param {MouseEvent} e */
	function handleClick(e) {
		// Select closest element with data-hydrate-click attribute, if any
		var target = e.target instanceof Element ? e.target.closest('[data-hydrate-click]') : null
		// If the target has the attribute, store it and set data-waiting on <html>
		if (target instanceof HTMLElement) {
			clickedElement = target
			clickedId = target.id || null
			document.documentElement.setAttribute('data-waiting', 'true')
		} else if (document.documentElement.getAttribute('data-waiting') === 'true') {
			// Click landed elsewhere while waiting: cancel the pending re-trigger
			clickedElement = null
			clickedId = null
			document.documentElement.removeAttribute('data-waiting')
		}
	}

	window.addEventListener('click', handleClick, true)

	var observer = new MutationObserver(function (mutations) {
		mutations.forEach(function (mutation) {
			if (mutation.type === 'attributes') {
				// data-waiting was cleared by onMount after hydration: replay the
				// pending click on the (now hydrated) element and tear down.
				if (
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
				// Hydration finished. If a click was pending, the data-waiting
				// branch above already replayed it and disconnected this observer,
				// so we only reach here when no click was pending. Tear down the
				// interceptor so later clicks behave normally.
				if (mutation.attributeName === 'data-hydrated') {
					window.removeEventListener('click', handleClick, true)
					observer.disconnect()
				}
			}
		})
	})

	observer.observe(document.documentElement, { attributes: true })
})()
