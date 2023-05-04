import { writable } from 'svelte/store'
import { browser } from '$app/environment'

/** What's being rendered */
type Theme = 'light' | 'dark'
/** User selected status, defaults to `auto` */
type UserTheme = Theme | 'auto'
const userThemeKey = 'user-theme'
const prefersDark =
	typeof matchMedia === 'undefined' ? false : matchMedia('(prefers-color-scheme: dark)').matches

console.log('prefersDark', prefersDark)

if (typeof matchMedia !== 'undefined') {
	matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
		const newColorScheme = event.matches ? 'dark' : 'light'
		if (userTheme.subscribe((value) => value === 'auto')) {
			theme.set(newColorScheme)
		}
	})
}

export const theme = writable<Theme>('light')
export const userTheme = writable<UserTheme>(
	browser ? (localStorage.getItem(userThemeKey) as UserTheme) || 'auto' : 'auto'
)

userTheme.subscribe((value) => {
	theme.set(value === 'auto' ? (prefersDark ? 'dark' : 'light') : value)
})

theme.subscribe((value) => {
	browser && document.documentElement.setAttribute('color-scheme', value)
})

export function toggleTheme() {
	userTheme.update((current) => {
		let newTheme: UserTheme
		if (current === 'auto') {
			newTheme = 'dark'
		} else if (current === 'dark') {
			newTheme = 'light'
		} else {
			newTheme = 'auto'
		}
		console.log('toggle from', current, 'to', newTheme)
		localStorage.setItem(userThemeKey, newTheme)
		return newTheme
	})
}
