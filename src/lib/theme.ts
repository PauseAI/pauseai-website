import { writable } from 'svelte/store'
import { browser } from '$app/environment'

/** What's being rendered */
type Theme = 'light' | 'dark'
/** User selected status, defaults to `auto` */
type UserTheme = Theme | 'auto'
const userThemeKey = 'user-theme'
const prefersDark =
	typeof matchMedia === 'undefined' ? false : matchMedia('(prefers-color-scheme: dark)').matches

const initialUserTheme = (browser ? localStorage.getItem(userThemeKey) : 'auto') as UserTheme
const initialTheme =
	initialUserTheme === 'auto' ? (prefersDark ? 'dark' : 'light') : initialUserTheme

export const theme = writable<Theme>(initialTheme)
export const userTheme = writable<UserTheme>(initialUserTheme)

if (typeof matchMedia !== 'undefined') {
	matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
		const newColorScheme = event.matches ? 'dark' : 'light'
		// Only update if user is on auto
		userTheme.subscribe((value) => {
			if (value === 'auto') {
				theme.set(newColorScheme)
			}
		})()
	})
}

userTheme.subscribe((value) => {
	theme.set(value === 'auto' ? (prefersDark ? 'dark' : 'light') : value)
})

theme.subscribe((value) => {
	if (browser) document.documentElement.setAttribute('color-scheme', value)
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
		localStorage.setItem(userThemeKey, newTheme)
		return newTheme
	})
}
