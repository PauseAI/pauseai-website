import { env } from '$env/dynamic/private'
import * as logic from './env'

/**
 * Server-only environment helpers for SvelteKit.
 * These are initialized with the current environment variables from SvelteKit.
 */

const context = {
	CI: env.CI,
	DEV: env.DEV,
	PARAGLIDE_LOCALES: env.PARAGLIDE_LOCALES
}

export const isDev = () => logic.isDev(context)
export const getDevContext = () => logic.getDevContext(context)
export const possiblyOverriddenLocales = (defaults: { locales: string[] }) =>
	logic.possiblyOverriddenLocales(context, defaults)
