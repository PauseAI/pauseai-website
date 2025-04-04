// file initialized by the Paraglide-SvelteKit CLI - Feel free to edit it
import { createI18n } from '@inlang/paraglide-sveltekit'
import * as runtime from '$lib/paraglide/runtime.js'

export const L10NS_BASE_DIR = './src/temp/translations'
export const MARKDOWN_L10NS = `${L10NS_BASE_DIR}/md`
export const MESSAGE_L10NS = `${L10NS_BASE_DIR}/json`
const STATIC_PATH_PREFIX = '../../static'
const staticFiles = import.meta.glob('../../static/*', {
	query: '?raw'
})

export const i18n = createI18n(runtime, {
	prefixDefaultLanguage: 'always',
	exclude: Object.keys(staticFiles).map((path) => path.substring(STATIC_PATH_PREFIX.length))
})
