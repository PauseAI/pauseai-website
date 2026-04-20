// Reads the Vite client manifest to find which CSS files a given post's module
// tree depends on, so we can inject <link rel="stylesheet"> tags into the
// prerendered HTML. Without this, component CSS inside .md files loads only
// after hydration (dynamic chunk boundary), causing a flash of unstyled content.
//
// Manifest shape: https://vite.dev/guide/backend-integration.html
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
		const path = join(process.cwd(), '.svelte-kit/output/client/.vite/manifest.json')
		cachedManifest = JSON.parse(readFileSync(path, 'utf-8')) as Manifest
	} catch {
		// Dev mode or manifest unavailable — no FOUC to fix there anyway.
		cachedManifest = null
	}
	return cachedManifest
}

function manifestKey(slug: string, locale: string): string {
	return locale === 'en' ? `src/posts/${slug}.md` : `l10n-cage/md/${locale}/${slug}.md`
}

export function cssForPost(slug: string, locale: string): string[] {
	const manifest = loadManifest()
	if (!manifest) return []
	const seen = new Set<string>()
	const css = new Set<string>()
	const walk = (k: string) => {
		if (seen.has(k)) return
		seen.add(k)
		const entry = manifest[k]
		if (!entry) return
		for (const c of entry.css ?? []) css.add(`/${c}`)
		for (const imp of entry.imports ?? []) walk(imp)
	}
	walk(manifestKey(slug, locale))
	return [...css]
}
