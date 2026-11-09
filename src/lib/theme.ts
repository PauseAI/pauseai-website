import { writable, get } from 'svelte/store'
import { browser } from '$app/environment'
import { getItem, setItem } from '$lib/localStorage'

/** What's being rendered */
type Theme = 'light' | 'dark'
/** User selected status, defaults to `auto` */
type UserTheme = Theme | 'auto'
const userThemeKey = 'user-theme'

const getSystemTheme = () =>
	typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
		? 'dark'
		: 'light'

const initialUserTheme = (getItem(userThemeKey) || 'auto') as UserTheme
const initialTheme = initialUserTheme === 'auto' ? getSystemTheme() : initialUserTheme

const theme = writable<Theme>(initialTheme)
export const userTheme = writable<UserTheme>(initialUserTheme)

if (typeof matchMedia !== 'undefined') {
	matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
		const newColorScheme = event.matches ? 'dark' : 'light'
		// Only update if user is on auto
		if (get(userTheme) === 'auto') {
			theme.set(newColorScheme)
		}
	})
}

userTheme.subscribe((value) => {
	theme.set(value === 'auto' ? getSystemTheme() : value)
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
		setItem(userThemeKey, newTheme)
		return newTheme
	})
}
