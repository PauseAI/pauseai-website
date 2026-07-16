import { enhancedImages } from '@sveltejs/enhanced-img'
import { sveltekit } from '@sveltejs/kit/vite'
import { execSync } from 'child_process'
import dotenv from 'dotenv'
import { FontaineTransform } from 'fontaine'
import fs from 'fs'
import path from 'path'
import discardDuplicates from 'postcss-discard-duplicates'
import { defineConfig, type Plugin } from 'vite'
import lucidePreprocess from 'vite-plugin-lucide-preprocess'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { isDev } from './src/lib/env'
import { MARKDOWN_L10NS } from './src/lib/l10n'
import { locales as compiledLocales } from './src/lib/paraglide/runtime.js'
import { configDefaults } from 'vitest/config'

/**
 * Dev-only middleware: Netlify's `/.netlify/*` routes don't exist in the
 * SvelteKit dev server. Without this, every such request logs a full stack
 * trace. Intercept early and respond with a short console note instead.
 */
function suppressNetlifyRoute404s(): Plugin {
	return {
		name: 'pauseai:suppress-netlify-route-404s',
		apply: 'serve',
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				const url = req.url ?? ''
				if (url.startsWith('/.netlify/')) {
					console.warn(`[dev] 404 ${url} — Netlify routes are not served locally`)
					res.statusCode = 404
					res.setHeader('Content-Type', 'text/plain')
					res.end('Not found: Netlify routes are not served in dev')
					return
				}
				next()
			})
		}
	}
}

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
	// Guarantees server can see .env (on e.g. hot restart). In visual-diff
	// runs we flip `override` off so the shell-set fake API keys win over
	// the empty values in .env (copied from template.env) — otherwise the
	// Airtable/Notion SDKs short-circuit on empty key before making any
	// request, and MSW never gets to intercept and serve the fixture.
	dotenv.config({ override: process.env.VISUAL_TEST !== '1' })

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

		css: {
			// Fontaine generates one fallback @font-face per src URL × unicode-range
			// subset, which are metric-identical copies; collapse them.
			postcss: {
				plugins: [discardDuplicates()]
			}
		},

		// Improve build performance and reduce log output
		build: {
			// Do not output sizes for every chunk
			reportCompressedSize: false,
			// Increase warning limit to reduce output
			chunkSizeWarningLimit: 5000,
			// Improve cache usage
			cssCodeSplit: true,
			sourcemap: true,
			// Exclude repos locale paths not in runtime.locales
			rollupOptions: {
				external: getLocaleExcludePatterns()
			}
		} as const,

		// Vitest config — `pnpm test` runs Vitest, which by default would
		// also pick up `tests/visual/smoke.spec.ts`. That file imports
		// `test` from `@chromatic-com/playwright` (a Playwright test runner
		// wrapper), and Playwright's `test.describe()` throws
		// "did not expect test.describe() to be called here" when invoked
		// outside the Playwright runner. The visual suite is launched
		// separately via `playwright.config.ts` (and Chromatic), so exclude
		// it from Vitest's discovery. `exclude` replaces Vitest's defaults,
		// so spread `configDefaults.exclude` to keep node_modules / dist /
		// cypress / config files filtered out.
		test: {
			exclude: [...configDefaults.exclude, 'tests/visual/**']
		},
		plugins: [
			suppressNetlifyRoute404s(),
			lucidePreprocess(),
			enhancedImages(),
			// Generates "<font> fallback" @font-face rules whose metrics match the webfonts,
			// so text doesn't shift when they swap in (see --font-* variables in styles.css).
			// Each list needs fonts that resolve via src:local() across platforms —
			// Tinos/Arimo/Noto cover Linux, where Times/Georgia/Arial don't exist.
			FontaineTransform.vite({
				fallbacks: {
					'Roboto Slab': ['Georgia', 'Times New Roman', 'Tinos', 'Noto Serif'],
					'Saira Condensed': ['Arial', 'Arimo', 'Noto Sans']
				}
			}),
			sveltekit(),
			!isDev(process.env) &&
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
