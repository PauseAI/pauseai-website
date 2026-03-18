import { enhancedImages } from '@sveltejs/enhanced-img'
import { sveltekit } from '@sveltejs/kit/vite'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import lucidePreprocess from 'vite-plugin-lucide-preprocess'
import { isDev } from './src/lib/env'
import { MARKDOWN_L10NS } from './src/lib/l10n'
import { locales as compiledLocales } from './src/lib/paraglide/runtime.js'

function getLocaleExcludePatterns(): RegExp[] {
	const md = path.resolve(MARKDOWN_L10NS)
	const reposLocales = fs.existsSync(md)
		? fs.readdirSync(md).filter((item) => fs.statSync(path.join(md, item)).isDirectory())
		: [] // the directory may not exist when running tests
	//  console.debug(`📁 Locale directories found in repos: ${reposLocales.join(', ')}`)
	const locales: readonly string[] = compiledLocales
	const toExclude = reposLocales.filter((locale) => !locales.includes(locale))
	//  console.debug(`🚫 Excluding locales from build: [${toExclude.join(', ')]}`)

	return toExclude.map((locale) => {
		const pattern = new RegExp(`${MARKDOWN_L10NS}/${locale}/`)
		//      console.debug(`📋 Created exclude pattern: ${pattern}`)
		return pattern
	})
}

export default defineConfig(() => {
	// Guarantees server can see .env (on e.g. hot restart)
	dotenv.config({ override: true })

	return {
		define: {
			// Make PARAGLIDE_LOCALES accessible to browser code via import.meta.env
			'import.meta.env.PARAGLIDE_LOCALES': JSON.stringify(process.env.PARAGLIDE_LOCALES)
		},

		server: {
			port: 37572,
			fs: {
				// Allow serving files from l10n-cage directory
				allow: [MARKDOWN_L10NS]
			}
		},

		// Improve build performance and reduce log output
		build: {
			// Do not output sizes for every chunk
			reportCompressedSize: false,
			// Increase warning limit to reduce output
			chunkSizeWarningLimit: 5000,
			// Enable multi-threading with esbuild for faster builds
			minify: 'esbuild',
			// Improve cache usage
			cssCodeSplit: true,
			// Generate sourcemaps in development, disable in production unless explicitly enabled
			sourcemap: isDev() || !process.env.VITE_DISABLE_SOURCEMAPS,
			// Exclude repos locale paths not in runtime.locales
			rollupOptions: {
				external: getLocaleExcludePatterns()
			}
		} as const,
		plugins: [lucidePreprocess(), enhancedImages(), sveltekit()]
	}
})
