// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- not designed for strong typing
// @ts-nocheck

import adapterNetlify from '@sveltejs/adapter-netlify'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { mdsvex } from 'mdsvex'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import rehypeSlug from 'rehype-slug'
import remarkHeadingId from 'remark-heading-id'
import remarkToc from 'remark-toc'
import remarkUnwrapImages from 'remark-unwrap-images'

import settings from './project.inlang/settings.json' with { type: 'json' }

// Export configuration flags for use in build scripts
export const USE_EDGE_FUNCTIONS = true

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	extensions: ['.md'],
	layout: {
		_: dirname(fileURLToPath(import.meta.url)) + '/src/mdsvex.svelte'
	},
	remarkPlugins: [remarkUnwrapImages, [remarkToc, { tight: true }], remarkHeadingId],
	rehypePlugins: [rehypeSlug]
}

/** @type {[string, ((warning: import('@sveltejs/kit').Warning) => boolean) | undefined][]} */
const skipWarnings = [
	['a11y_missing_attribute', (warning) => warning.message.includes('title')], // Skip warnings about missing title attributes on iframes
	['a11y_no_noninteractive_tabindex'] // Skip warnings about tabindex on non-interactive elements (like iframes)
]

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [vitePreprocess({ script: true }), mdsvex(mdsvexOptions)],
	// Custom warning handler to selectively filter out specific a11y warnings
	onwarn(warning, handler) {
		// Skip specific accessibility warnings
		for (const [code, filter] of skipWarnings) {
			if (warning.code === code && (!filter || filter(warning))) {
				return
			}
		}
		// Call the default handler for all other warnings
		handler(warning)
	},
	kit: {
		adapter: adapterNetlify({
			edge: USE_EDGE_FUNCTIONS
		}),
		alias: {
			$assets: 'src/assets',
			$api: 'src/routes/api'
		},
		prerender: {
			// Allows dead links to be rendered
			handleHttpError: 'warn',
			// Handle missing anchor IDs by warning instead of failing
			handleMissingId: 'warn',
			entries: ['*'].concat(settings.locales.map((locale) => '/' + locale))
		},
		experimental: {
			remoteFunctions: true
		}
	}
}

export default config
