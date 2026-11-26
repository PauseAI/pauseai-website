const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]'])

/** A local server or a Netlify deploy preview, as opposed to the real site. */
export function isTestHostname(hostname: string): boolean {
	return LOCAL_HOSTNAMES.has(hostname) || hostname.endsWith('.netlify.app')
}

// Netlify's deploy contexts other than the live site.
const NON_PRODUCTION_CONTEXTS = new Set(['deploy-preview', 'branch-deploy', 'dev'])

/**
 * A local server, deploy preview or branch deploy. Unlike isTestHostname, a production deploy
 * reached on a *.netlify.app address (the site's alias, or an immutable deploy's URL) is not one.
 */
export function isNonProductionDeploy(
	hostname: string,
	platform: App.Platform | undefined
): boolean {
	if (LOCAL_HOSTNAMES.has(hostname)) return true
	const deploy = platform?.context.deploy as Partial<App.Platform['context']['deploy']> | undefined
	// A published preview or branch deploy keeps its original context while serving the live site.
	if (deploy?.published) return false
	if (deploy?.context) return NON_PRODUCTION_CONTEXTS.has(deploy.context)
	// A branch deploy's `<branch>--` prefix reads like an immutable production deploy's
	// `<deploy id>--`, so without a context only a deploy preview's address is trusted.
	return /^deploy-preview-\d+--[a-z0-9-]+\.netlify\.app$/.test(hostname)
}
