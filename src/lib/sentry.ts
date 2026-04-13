// eslint-disable-next-line no-restricted-syntax
export const SENTRY_RELEASE = import.meta.env.SENTRY_RELEASE as string | undefined

import { minimatch } from 'minimatch'

const LEGITIMATE_PATHS: string[] = [
	'/.well-known/assetlinks.json',
	'/.well-known/openpgpkey/policy',
	'/.well-known/traffic-advice',
	'/apple-touch-icon-precomposed.png',
	'/apple-touch-icon.png',
	'/favicon.ico',
	'/sitemap-index.xml'
]

const BOT_PATHS = [
	'**/*.php',
	'**/*.php7',
	'**/*.php8',
	'/account/**',
	'/accounts/**',
	'/app/**',
	'/auth',
	'/auth/**',
	'/authentication',
	'/cart.json',
	'/create-account',
	'/customer/**',
	'/gtm.js',
	'/log-in',
	'/login',
	'/m/**',
	'/member/**',
	'/members/**',
	'/mobile/**',
	'/my-account',
	'/myaccount',
	'/new-account',
	'/profile/**',
	'/register',
	'/registration',
	'/session/**',
	'/sign_in',
	'/sign_up',
	'/sign-in',
	'/sign-up',
	'/signin',
	'/signup',
	'/tiny',
	'/user/**',
	'/users/**'
]

/** Returns `true` if a 404 at the given path should be silently ignored. */
export function isIgnored404(path: string): boolean {
	return LEGITIMATE_PATHS.concat(BOT_PATHS).some((pattern) =>
		minimatch(path, pattern, { nocase: true })
	)
}
