// Shared parsing for the `@visualDiffEnabled` annotation. Used by:
// - `routes.ts` to decide which paths smoke.spec.ts iterates over
// - `scope-comment.ts` to render the PR coverage comment
//
// Keeping the scanner in one place prevents the two consumers' ideas of
// "which routes are covered" from drifting.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// Anchored to a comment prefix so prose mentioning the annotation key in a
// post body can't accidentally toggle coverage. Reason is optional.
const ANNOTATION =
	/(?:<!--|\/\/)\s*@visualDiffEnabled:\s*(true|false)\b(?:\s*—\s*([^\n]*?))?(?:\s*-->)?\s*$/m

type Annotation = { enabled: boolean; reason?: string }

function readAnnotation(file: string): Annotation | undefined {
	const match = readFileSync(file, 'utf8').match(ANNOTATION)
	if (!match) return undefined
	return { enabled: match[1] === 'true', reason: match[2]?.trim() || undefined }
}

export type PageClass = { path: string; annotation: Annotation | undefined }

export function classifyPages(routesDir: string): PageClass[] {
	const out: PageClass[] = []
	walk(routesDir, '', out)
	return out
}

function walk(dir: string, prefix: string, out: PageClass[]): void {
	const files = ['+page.svelte', '+page.ts'].map((name) => join(dir, name)).filter(existsSync)
	if (files.length) {
		let annotation: Annotation | undefined
		for (const file of files) {
			const found = readAnnotation(file)
			if (found) {
				annotation = found
				break
			}
		}
		out.push({ path: prefix || '/', annotation })
	}
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue
		if (entry.name.startsWith('[')) continue // dynamic segment, can't visit directly
		walk(join(dir, entry.name), prefix + '/' + entry.name, out)
	}
}

export type PostClass = { slug: string; covered: boolean }

export function classifyPosts(postsDir: string): PostClass[] {
	const out: PostClass[] = []
	for (const entry of readdirSync(postsDir, { withFileTypes: true })) {
		if (!entry.isFile() || !entry.name.endsWith('.md')) continue
		const ann = readAnnotation(join(postsDir, entry.name))
		out.push({ slug: '/' + entry.name.replace(/\.md$/, ''), covered: ann?.enabled === true })
	}
	return out.sort((a, b) => a.slug.localeCompare(b.slug))
}
