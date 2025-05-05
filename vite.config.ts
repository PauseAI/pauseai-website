import { sveltekit } from '@sveltejs/kit/vite'
import { enhancedImages } from '@sveltejs/enhanced-img'
import { defineConfig } from 'vite'
import dotenv from 'dotenv'
import { isDev, getDevContext } from './src/lib/env'
import { execSync } from 'child_process'
import { MARKDOWN_L10NS } from './src/lib/l10n'
import { locales } from './src/lib/paraglide/runtime'
import fs from 'fs'
import path from 'path'

function getLocaleExcludePatterns(): RegExp[] {
	const md = path.resolve(MARKDOWN_L10NS)
	const reposLocales = fs
		.readdirSync(md)
		.filter((item) => fs.statSync(path.join(md, item)).isDirectory())
	//  console.debug(`📁 Locale directories found in repos: ${reposLocales.join(', ')}`)
	const toExclude = reposLocales.filter((locale) => !locales.includes(locale))
	//  console.debug(`🚫 Excluding locales from build: [${toExclude.join(', ')]}`)

	return toExclude.map((locale) => {
		const pattern = new RegExp(`${MARKDOWN_L10NS}/${locale}/`)
		//      console.debug(`📋 Created exclude pattern: ${pattern}`)
		return pattern
	})
}

export default defineConfig(({ command, mode }) => {
	// Guarantees server can see .env (on e.g. hot restart)
	dotenv.config({ override: true })

	return {
		define: {
			// Make PARAGLIDE_LOCALES accessible to browser code via import.meta.env
			'import.meta.env.PARAGLIDE_LOCALES': JSON.stringify(process.env.PARAGLIDE_LOCALES)
		},

		server: {
			port: 37572
		},

		// Improve build performance and reduce log output
		build: {
			// Do not output sizes for every chunk
			reportCompressedSize: false,
			// Increase warning limit to reduce output
			chunkSizeWarningLimit: 5000,
			// Hide output for assets smaller than 1MB
			assetsInlineLimit: 1024 * 1024,
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
		},
		plugins: [
			{
				name: 'run-inlang-settings-before-scanning',
				// This hook runs before dependency scanning
				config(config, env) {
					// Run inlang-settings script to ensure directories and settings exist BEFORE any scanning happens
					// console.debug(`\n\ud83d\udd04 Checking localization settings (${getDevContext()}) before scanning...`)
					try {
						execSync(`tsx scripts/inlang-settings.ts`, { stdio: 'inherit' })
						// console.debug('\u2705 Localization settings verified')
					} catch (error) {
						console.error(
							'\u26a0\ufe0f Failed to verify localization settings:',
							(error as Error).message
						)
					}
					return config
				},
				// Keep the server configuration for any additional setup
				configureServer(server) {}
			},
			enhancedImages(),
			sveltekit()
		]
	}
})
