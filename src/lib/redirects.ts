import { redirect } from '@sveltejs/kit'

const REDIRECTS: Record<string, string> = {
	'/2025-feb': '/2025-february'
}

export function handleRedirects(path: string) {
	const target = REDIRECTS[path]
	if (target) throw redirect(301, target)
}
