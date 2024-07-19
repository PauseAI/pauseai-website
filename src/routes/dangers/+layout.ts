import type { Post } from '$lib/types'

// Update when adding new pages or changing slugs
const PAGE_ORDER = [
	'dangers/economiques-et-materiels',
	'dangers/pour-les-individus',
	'dangers/pour-la-societe',
	"dangers/pour-l'humanite"
]

export async function load({ fetch, url }) {
	const response = await fetch('/api/dangers')
	const posts: Post[] = await response.json()
	posts.sort((a, b) => PAGE_ORDER.indexOf(a.slug) - PAGE_ORDER.indexOf(b.slug))
	const slug = url.pathname.slice(1)
	return { posts, slug }
}
