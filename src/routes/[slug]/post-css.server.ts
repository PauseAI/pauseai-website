// Reads the Vite client manifest to find which CSS files a given post's module
// tree depends on, so we can inject <link rel="stylesheet"> tags into the
// prerendered HTML. Without this, component CSS inside .md files loads only
// after hydration (dynamic chunk boundary), causing a flash of unstyled content.
//
// Manifest shape docs: https://vite.dev/guide/backend-integration.html
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

interface ManifestEntry {
	file: string
	css?: string[]
	imports?: string[]
}

type Manifest = Record<string, ManifestEntry>

let cachedManifest: Manifest | null | undefined

function loadManifest(): Manifest | null {
	if (cachedManifest !== undefined) return cachedManifest
	try {
		// kit.outDir defaults to .svelte-kit; Vite writes its manifest inside
		// the client build output at .vite/manifest.json.
		const path = join(process.cwd(), '.svelte-kit/output/client/.vite/manifest.json')
		cachedManifest = JSON.parse(readFileSync(path, 'utf-8')) as Manifest
	} catch {
		// Dev mode or manifest unavailable — no FOUC to fix there anyway.
		cachedManifest = null
	}
	return cachedManifest
}

export function cssForPost(postSrc: string): string[] {
	const manifest = loadManifest()
	if (!manifest) return []
	const seen = new Set<string>()
	const css = new Set<string>()
	function walk(key: string) {
		if (seen.has(key)) return
		seen.add(key)
		const entry = manifest![key]
		if (!entry) return
		for (const c of entry.css ?? []) css.add(c)
		for (const imp of entry.imports ?? []) walk(imp)
	}
	walk(postSrc)
	return [...css].map((c) => `/${c}`)
}
