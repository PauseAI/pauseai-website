import i18n from 'sveltekit-i18n'
import type { Config } from 'sveltekit-i18n'

/** @type {import('sveltekit-i18n').Config} */
const config: Config = {
	loaders: [
		{
			locale: 'en',
			key: 'home',
			loader: async () => (await import('./translations/en/home.json')).default
		},
		{
			locale: 'nl',
			key: 'home',
			loader: async () => {
				try {
					return (await import('./translations/nl/home.json')).default
				} catch (error) {
					console.warn('Dutch translation file not found. Using English as fallback.')
					return (await import('./translations/en/home.json')).default
				}
			}
		}
		// Add other languages and JSON files as needed
	]
}

export const { t, locale, locales, loading, loadTranslations } = new i18n(config)
loading.subscribe(($loading) => $loading && console.log('Loading translations...'))
