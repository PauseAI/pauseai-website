import DOMPurify from 'isomorphic-dompurify'

const CONFIG = {
	ALLOWED_TAGS: ['a', 'strong'],
	ALLOWED_ATTR: ['href']
}

export function safeHtml(dirty: string): string {
	return DOMPurify.sanitize(dirty, CONFIG) as string
}
