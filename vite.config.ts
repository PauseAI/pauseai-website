import { enhancedImages } from '@sveltejs/enhanced-img'
import { sveltekit } from '@sveltejs/kit/vite'
import { execSync } from 'child_process'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import lucidePreprocess from 'vite-plugin-lucide-preprocess'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { isDev } from './src/lib/env'
import { MARKDOWN_L10NS } from './src/lib/l10n'
import { locales as compiledLocales } from './src/lib/paraglide/runtime.js'

function getSentryRelease(): string | undefined {
	try {
		return process.env.COMMIT_REF || execSync('git rev-parse HEAD').toString().trim()
	} catch {
		return undefined
	}
}

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
			'import.meta.env.SENTRY_RELEASE': JSON.stringify(getSentryRelease())
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
		plugins: [
			lucidePreprocess(),
			enhancedImages(),
			sveltekit(),
			!isDev() &&
			process.env.SENTRY_AUTH_TOKEN &&
			process.env.SENTRY_ORG &&
			process.env.SENTRY_PROJECT
				? sentryVitePlugin({
						org: process.env.SENTRY_ORG,
						project: process.env.SENTRY_PROJECT,
						authToken: process.env.SENTRY_AUTH_TOKEN,
						release: { name: getSentryRelease() },
						sourcemaps: {
							filesToDeleteAfterUpload: ['./build/**/*.map']
						},
						telemetry: false,
						silent: true
					})
				: null
		].filter(Boolean)
	}
})
