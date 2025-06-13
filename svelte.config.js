import adapterPatchPrerendered from './src/lib/adapter-patch-prerendered.js'
import adapterNetlify from '@sveltejs/adapter-netlify'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

import { mdsvex, escapeSvelte } from 'mdsvex'
import shiki from 'shiki'
import remarkUnwrapImages from 'remark-unwrap-images'
import remarkToc from 'remark-toc'
import remarkHeadingId from 'remark-heading-id'
import rehypeSlug from 'rehype-slug'

import { locales } from './src/lib/paraglide/runtime.js'

// Export configuration flags for use in build scripts
export const USE_EDGE_FUNCTIONS = true

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	extensions: ['.md'],
	layout: {
		_: './src/mdsvex.svelte'
	},
	highlight: {
		highlighter: async (code, lang = 'text') => {
			const highlighter = await shiki.getHighlighter({ theme: 'poimandres' })
			const html = escapeSvelte(highlighter.codeToHtml(code, { lang }))
			return `{@html \`${html}\` }`
		}
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
		adapter: adapterPatchPrerendered(
			adapterNetlify({
				edge: USE_EDGE_FUNCTIONS
			})
		),
		alias: {
			$assets: 'src/assets',
			$api: 'src/routes/api'
		},
		prerender: {
			// Allows dead links to be rendered
			handleHttpError: 'warn',
			entries: ['*'].concat(locales.map((locale) => '/' + locale))
		}
	}
}

export default config
