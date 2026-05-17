import type { LinkType } from './types'

export function getLinkType(href: string | null): LinkType {
	if (
		href &&
		(href.startsWith('http:') || href.startsWith('https:')) &&
		!href.startsWith('https://pauseai.info/') &&
		!(href.includes('s3.amazonaws') && href.includes('/pauseai-'))
	) {
		return 'external'
	} else if (href && href.startsWith('mailto:')) {
		return 'mail'
	}
	return 'internal'
}
