import adapterPatchPrerendered from './src/lib/adapter-patch-prerendered.js'
import adapterNetlify from '@sveltejs/adapter-netlify'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

import { mdsvex, escapeSvelte } from 'mdsvex'
import shiki from 'shiki'
import remarkUnwrapImages from 'remark-unwrap-images'
import remarkToc from 'remark-toc'
import remarkHeadingId from 'remark-heading-id'
import rehypeSlug from 'rehype-slug'

import fs from 'fs'

/**
 * @type {import('./project.inlang/settings.json')}
 */
const inlangSettings = JSON.parse(fs.readFileSync('./project.inlang/settings.json'))

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
	kit: {
		adapter: adapterPatchPrerendered(
			adapterNetlify({
				edge: true
			})
		),
		alias: {
			$assets: 'src/assets'
		},
		prerender: {
			// Allows dead links to be rendered
			handleHttpError: 'warn',
			entries: ['*'].concat(inlangSettings.languageTags.map((tag) => '/' + tag))
		}
	}
}

export default config
