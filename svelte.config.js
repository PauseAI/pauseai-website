// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- not designed for strong typing
// @ts-nocheck

import adapterNetlify from '@sveltejs/adapter-netlify'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

import { mdsvex } from 'mdsvex'
import remarkUnwrapImages from 'remark-unwrap-images'
import remarkToc from 'remark-toc'
import remarkHeadingId from 'remark-heading-id'
import rehypeSlug from 'rehype-slug'

import settings from './project.inlang/settings.json' with { type: 'json' }

// Export configuration flags for use in build scripts
export const USE_EDGE_FUNCTIONS = true

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	extensions: ['.md'],
	layout: {
		_: './src/mdsvex.svelte'
	},
	remarkPlugins: [remarkUnwrapImages, [remarkToc, { tight: true }], remarkHeadingId],
	rehypePlugins: [rehypeSlug]
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
	// Custom warning handler to selectively filter out specific a11y warnings
	onwarn(warning, handler) {
		// Skip specific accessibility warnings
		if (warning.code === 'a11y-missing-attribute' && warning.message.includes('title')) {
			// Skip warnings about missing title attributes on iframes
			return
		}
		if (warning.code === 'a11y-no-noninteractive-tabindex') {
			// Skip warnings about tabindex on non-interactive elements (like iframes)
			return
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
			entries: ['*'].concat(settings.locales.map((locale) => '/' + locale))
		}
	}
}

export default config
