// Renders the visual-diff scope PR comment body to stdout. Invoked by the
// visual-diff workflow after tests run; the output is uploaded as an artifact
// and posted to the PR by a companion workflow (visual-diff-comment.yml).
//
// Keep the output scannable — reviewers spend seconds, not minutes.

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { classifyPages, classifyPosts, type PageClass, type PostClass } from './annotations.ts'

const here = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(here, '../..')

type Kind = 'UNHANDLED' | 'AIRTABLE_CATCH_ALL' | 'NOTION_CATCH_ALL'

type UnhandledEntry = { method: string; url: string; kind: string; count: number }

function readUnhandled(): UnhandledEntry[] {
	const path = process.env.MSW_WARN_LOG
	if (!path || !existsSync(path)) return []
	const lines = readFileSync(path, 'utf8').split('\n').filter(Boolean)
	const counts = new Map<string, UnhandledEntry>()
	for (const line of lines) {
		const parts = line.split(/\s+/)
		if (parts.length < 3) continue
		const [kind, method, url] = parts
		const key = `${kind} ${method} ${url}`
		const existing = counts.get(key)
		if (existing) existing.count++
		else counts.set(key, { kind, method, url, count: 1 })
	}
	return [...counts.values()].sort((a, b) => b.count - a.count)
}

function escapeInline(text: string): string {
	return text
		.replace(/[<>]/g, (c) => (c === '<' ? '&lt;' : '&gt;'))
		.replace(/`/g, '\\`')
		.replace(/@/g, '@​') // zero-width space breaks @-mention auto-linking
}

function renderPages(pages: PageClass[], coveredCount: number): string {
	return `- **Pages:** ${coveredCount}/${pages.length} covered. _Included_ by default.`
}

function renderPosts(posts: PostClass[], coveredCount: number): string {
	return `- **Posts:** ${coveredCount}/${posts.length} covered. _Excluded_ by default (posts share a layout).`
}

function renderBreakdown(pages: PageClass[], posts: PostClass[]): string {
	const excluded = pages.filter((p) => p.annotation?.enabled === false)
	const coveredPosts = posts.filter((p) => p.covered)
	// Nested list: category names are outer bullets, items are inner bullets.
	// GitHub renders this with a clear indent so the content reads as
	// "inside the expanded section" without needing a blockquote border.
	const body: string[] = []
	if (excluded.length) {
		body.push('- **Pages excluded:**')
		for (const p of excluded) {
			const reason = escapeInline(p.annotation?.reason ?? 'no reason given')
			body.push(`  - \`${p.path}\`: ${reason}`)
		}
	}
	if (coveredPosts.length) {
		body.push('- **Posts covered:**')
		for (const p of coveredPosts) body.push(`  - \`${p.slug}\``)
	}
	return ['<details><summary>Route breakdown</summary>', '', ...body, '', '</details>'].join('\n')
}

const KIND_LABEL: Record<Kind, string> = {
	UNHANDLED: 'no handler; allowed through',
	AIRTABLE_CATCH_ALL: 'hit Airtable catch-all',
	NOTION_CATCH_ALL: 'hit Notion catch-all'
}

function renderUnhandled(entries: UnhandledEntry[]): string {
	if (entries.length === 0) return ''
	const total = entries.reduce((n, e) => n + e.count, 0)
	// Nested-list shape so the rows visibly belong to the expandable.
	const body: string[] = ['- **Endpoints:**']
	for (const e of entries) {
		const label = KIND_LABEL[e.kind as Kind] ?? e.kind
		body.push(`  - ${e.count}× \`${e.method} ${e.url}\` (${label})`)
	}
	body.push(
		'- **Fix:** add an explicit handler + fixture in `tests/visual/msw-handlers.ts` (so the page renders its populated layout against stable data), or exclude the page with `@visualDiffEnabled: false`.',
		"- **Why it matters:** without a fixture, CI gets either a 401 (endpoint needs auth) or drifting live data, so the snapshot won't match production."
	)
	return [
		`<details open><summary>⚠️ ${total} external request${total === 1 ? '' : 's'} not covered by fixtures</summary>`,
		'',
		...body,
		'',
		'</details>'
	].join('\n')
}

function main() {
	const pages = classifyPages(join(REPO_ROOT, 'src/routes'))
	const posts = classifyPosts(join(REPO_ROOT, 'src/posts'))
	const unhandled = readUnhandled()
	const coveredPages = pages.filter((p) => p.annotation?.enabled !== false).length
	const coveredPosts = posts.filter((p) => p.covered).length

	// Prefer SCOPE_HEAD_SHA (explicit pass-through of the PR head) over
	// GITHUB_SHA; for pull_request events the runner injects GITHUB_SHA as
	// the auto-generated merge-ref commit, not the PR branch tip.
	const fullSha = process.env.SCOPE_HEAD_SHA || process.env.GITHUB_SHA || ''
	const sha = fullSha.slice(0, 7) || 'unknown'
	const repo = process.env.GITHUB_REPOSITORY ?? 'PauseAI/pauseai-website'
	const commitLink = fullSha
		? `[\`${sha}\`](https://github.com/${repo}/commit/${fullSha})`
		: `\`${sha}\``
	const runId = process.env.GITHUB_RUN_ID
	const runLink = runId ? `[run #${runId}](https://github.com/${repo}/actions/runs/${runId})` : ''
	const chromaticUrl = process.env.CHROMATIC_BUILD_URL

	const blocks: string[] = []
	const metaLine = [`commit ${commitLink}`, runLink].filter(Boolean).join(' · ')
	blocks.push(`**Visual diff coverage**`, metaLine ? `_${metaLine}_` : '', '')
	if (chromaticUrl) {
		blocks.push(`[Review snapshots in Chromatic](${chromaticUrl})`, '')
	}
	blocks.push(renderPages(pages, coveredPages), renderPosts(posts, coveredPosts), '')
	blocks.push(renderBreakdown(pages, posts), '')
	const unhandledBlock = renderUnhandled(unhandled)
	if (unhandledBlock) blocks.push(unhandledBlock, '')
	blocks.push(
		'<details><summary>Not exercised</summary>',
		'',
		'- Pages that fetch from external APIs render against pinned fixtures, not live data.',
		'- Third-party widgets render as empty containers.',
		'- New browser-side third-party embeds (iframes, CDN scripts) aren’t flagged here.',
		'- Only `en` locale is built.',
		'',
		'</details>',
		''
	)
	const readmeUrl = `https://github.com/${repo}/blob/main/tests/visual/README.md`
	blocks.push(
		`[\`tests/visual/README.md\`](${readmeUrl}) explains the annotation syntax and the coverage model.`
	)

	process.stdout.write(blocks.join('\n') + '\n')
}

main()
