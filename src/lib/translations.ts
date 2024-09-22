import i18n from 'sveltekit-i18n'

/** @type {import('sveltekit-i18n').Config} */
const config = {
	loaders: [
		{
			locale: 'en',
			key: 'common',
			loader: async () => (await import('./translations/en/common.json')).default
		},
		{
			locale: 'nl',
			key: 'common',
			loader: async () => (await import('./translations/nl/common.json')).default
		},
		{
			locale: 'nl',
			key: 'home',
			route: '/',
			loader: async () => (await import('./translations/nl/home.json')).default
		},
		{
			locale: 'en',
			key: 'home',
			route: '/',
			loader: async () => (await import('./translations/en/home.json')).default
		}
	]
}

export const { t, locale, locales, loading, loadTranslations } = new i18n(config)
loading.subscribe(($loading) => $loading && console.log('Loading translations...'))
