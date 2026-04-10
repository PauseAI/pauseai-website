// Theme selection: picks the active theme before first paint.
// Reads user-theme from localStorage, checks system preference, and sets color-scheme on <html>.
// Exposed as window.applyTheme to allow re-runs.

;(function () {
	var userThemeKey = 'user-theme'

	window.applyTheme = function () {
		var userTheme = 'auto'
		try {
			userTheme = localStorage.getItem(userThemeKey) || 'auto'
		} catch (e) {
			// localStorage might be unavailable
		}

		var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
		var theme = userTheme === 'auto' ? (prefersDark ? 'dark' : 'light') : userTheme

		document.documentElement.setAttribute('color-scheme', theme)
	}

	window.applyTheme()
})()
