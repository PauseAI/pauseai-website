import { CI, DEV, PARAGLIDE_LOCALES } from '$app/env/private';
import * as logic from './env';

/**
 * Server-only environment helpers for SvelteKit.
 * These are initialized with the current environment variables from SvelteKit.
 */
const context = { CI, DEV, PARAGLIDE_LOCALES };

export const isDev = () => logic.isDev(context);
export const getDevContext = () => logic.getDevContext(context);
export const possiblyOverriddenLocales = (defaults: { locales: string[] }) => logic.possiblyOverriddenLocales(context, defaults);
