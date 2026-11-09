/** A local server or a Netlify deploy preview, as opposed to the real site. */
export function isTestHostname(hostname: string): boolean {
	return (
		hostname === 'localhost' ||
		hostname === '127.0.0.1' ||
		hostname === '[::1]' ||
		hostname.endsWith('.netlify.app')
	)
}
