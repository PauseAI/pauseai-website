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

// Anchored to a comment prefix so plain prose mentioning "@visualDiffEnabled"
// in a post body doesn't accidentally toggle the flag.
const ANNOTATION = /(?:<!--|\/\/)\s*@visualDiffEnabled:\s*(true|false)\b/

function readAnnotation(file: string): boolean | undefined {
	const match = readFileSync(file, 'utf8').match(ANNOTATION)
	return match ? match[1] === 'true' : undefined
}

function pageAnnotation(dir: string): boolean | undefined {
	for (const name of ['+page.svelte', '+page.ts']) {
		const file = join(dir, name)
		if (existsSync(file)) {
			const value = readAnnotation(file)
			if (value !== undefined) return value
		}
	}
	return undefined
}

function hasPage(dir: string): boolean {
	return existsSync(join(dir, '+page.svelte')) || existsSync(join(dir, '+page.ts'))
}

function discoverPostSamples(): string[] {
	const samples: string[] = []
	for (const entry of readdirSync(POSTS_DIR, { withFileTypes: true })) {
		if (!entry.isFile() || !entry.name.endsWith('.md')) continue
		if (readAnnotation(join(POSTS_DIR, entry.name)) === true) {
			samples.push('/' + entry.name.replace(/\.md$/, ''))
		}
	}
	return samples
}

function walk(dir: string, prefix: string, out: string[]): void {
	if (hasPage(dir) && pageAnnotation(dir) !== false) {
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
