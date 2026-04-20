import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const ROUTES_DIR = join(here, '../../src/routes')
const POSTS_DIR = join(here, '../../src/posts')

// Opt in/out of the visual diff via a `@visualDiffEnabled` annotation colocated
// with the page — so renames move the flag with the file. The same comment
// syntax works across +page.svelte / +page.ts / posts/*.md:
//
//   <!-- @visualDiffEnabled: false — admin-only tool -->      (opt out)
//   // @visualDiffEnabled: false — form state                 (opt out)
//   <!-- @visualDiffEnabled: true — post with banner image -->(opt in)
//
// Non-post pages (auto-discovered by the walker) default to **included**.
// Posts (100+ under src/posts/ rendered via [slug]) default to **excluded**,
// since they share a layout — only samples of distinct variants opt in.

const ANNOTATION = /@visualDiffEnabled:\s*(true|false)\b/

function readAnnotation(file: string): 'true' | 'false' | undefined {
	const match = readFileSync(file, 'utf8').match(ANNOTATION)
	return match?.[1] as 'true' | 'false' | undefined
}

function hasPage(dir: string): { svelte?: string; ts?: string } | null {
	const svelte = join(dir, '+page.svelte')
	const ts = join(dir, '+page.ts')
	const hasSvelte = existsSync(svelte)
	const hasTs = existsSync(ts)
	if (!hasSvelte && !hasTs) return null
	return {
		svelte: hasSvelte ? svelte : undefined,
		ts: hasTs ? ts : undefined
	}
}

function pageOptsOut(files: { svelte?: string; ts?: string }): boolean {
	for (const file of [files.svelte, files.ts]) {
		if (!file) continue
		if (readAnnotation(file) === 'false') return true
	}
	return false
}

function discoverPostSamples(): string[] {
	const samples: string[] = []
	for (const entry of readdirSync(POSTS_DIR, { withFileTypes: true })) {
		if (!entry.isFile() || !entry.name.endsWith('.md')) continue
		if (readAnnotation(join(POSTS_DIR, entry.name)) === 'true') {
			samples.push('/' + entry.name.replace(/\.md$/, ''))
		}
	}
	return samples
}

function walk(dir: string, prefix: string, out: string[]): void {
	const files = hasPage(dir)
	if (files && !pageOptsOut(files)) {
		out.push(prefix || '/')
	}
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue
		if (entry.name.startsWith('[')) continue // dynamic segment, can't visit directly
		walk(join(dir, entry.name), prefix + '/' + entry.name, out)
	}
}

function discoverRouteDirs(): string[] {
	const routes: string[] = []
	walk(ROUTES_DIR, '', routes)
	return routes
}

const postSamples = discoverPostSamples()

if (postSamples.length < 3) {
	throw new Error(
		`Visual post-sample discovery found only ${postSamples.length} samples — ` +
			`add "<!-- @visualDiffEnabled: true -->" to representative posts in src/posts/. ` +
			`Cover the template variants: banner image, link-heavy, long-form, embedded Svelte components, …`
	)
}

export const ROUTES = [...discoverRouteDirs(), ...postSamples].sort()

if (ROUTES.length < 5) {
	throw new Error(
		`Visual route discovery found only ${ROUTES.length} routes — src/routes/ probably moved`
	)
}
