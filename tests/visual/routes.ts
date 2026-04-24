import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { classifyPages, classifyPosts } from './annotations.ts'

const here = dirname(fileURLToPath(import.meta.url))
const ROUTES_DIR = join(here, '../../src/routes')
const POSTS_DIR = join(here, '../../src/posts')

// Opt in/out of the visual diff via a `@visualDiffEnabled` annotation colocated
// with the page; see `annotations.ts` for the grammar. Non-post pages default
// to *included* and opt out; posts default to *excluded* and opt in.

const pages = classifyPages(ROUTES_DIR).filter((p) => p.annotation?.enabled !== false)
const posts = classifyPosts(POSTS_DIR).filter((p) => p.covered)

if (posts.length < 3) {
	throw new Error(
		`Visual post-sample discovery found only ${posts.length} samples. ` +
			`Add "<!-- @visualDiffEnabled: true -->" to representative posts in src/posts/. ` +
			`Cover the template variants: banner image, link-heavy, long-form, embedded Svelte components, …`
	)
}

export const ROUTES = [...pages.map((p) => p.path), ...posts.map((p) => p.slug)].sort()

if (ROUTES.length < 5) {
	throw new Error(
		`Visual route discovery found only ${ROUTES.length} routes — src/routes/ probably moved`
	)
}
