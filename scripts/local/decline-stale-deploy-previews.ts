/**
 * Cancels (rejects) Netlify deploy previews from external contributors that
 * are stale or no longer needed.
 *
 * A deploy preview from an external contributor enters the `pending_review`
 * state on Netlify (the Deploy Request Policy holds builds from unrecognized
 * authors for manual approval). This script cancels every `pending_review`
 * deploy that meets EITHER of these conditions:
 *
 *   1. There is a newer commit on the PR (i.e. the contributor pushed
 *      again — the old pending deploy is for a non-head commit and is
 *      superseded). This is detected by comparing the deploy's `commit_ref`
 *      against the PR's head SHA from the GitHub API, NOT by deploy
 *      `created_at`: accepting an older commit creates a new `ready` deploy
 *      record with a recent timestamp that would wrongly look "newer" than
 *      a genuinely-newer pending commit. So: if the PR head commit is
 *      accepted, all earlier pending deploys are cancelled; if the head is
 *      still pending, only it is left and older pending deploys are
 *      cancelled. Whether the head's deploy is pending or accepted is
 *      irrelevant — only the commit SHA matters.
 *   2. The pull request that triggered the deploy has been merged.
 *
 * Only native Netlify deploy previews are affected. The `/preview` command
 * (triggered via a build hook from `.github/workflows/preview-command.yml`)
 * is intentionally left alone — those deploys are triggered by a trusted
 * maintainer via a build hook and never enter `pending_review`.
 *
 * Detection of "needs review" relies entirely on Netlify's `pending_review`
 * state, so no GitHub API calls are needed for that part. The deploy also
 * carries a `pending_review_reason` (e.g. "sensitive-variables") explaining
 * why it was held.
 *
 * API quirk: the default `GET /sites/{id}/deploys` listing EXCLUDES
 * `pending_review` deploys — they only surface when the server-side
 * `state=pending_review` filter is applied. So this script fetches the
 * candidate set with that filter only. Condition 1 does NOT need a second
 * unfiltered deploy fetch: it compares the pending deploy's `commit_ref`
 * against the PR head SHA (fetched once per PR from the GitHub API and
 * cached), so the "is there a newer commit?" question is answered by the
 * PR metadata, not by scanning other deploy records.
 *
 * Condition 2 (merged PR) uses the same cached GitHub PR fetch as
 * condition 1 (the PR object carries both `head.sha` and `merged`), so a
 * single GitHub API call per PR serves both checks. Works without a token
 * for public repos (rate-limited to 60/hour per IP vs. 5000/hour with a
 * token). Netlify exposes the PR number as `review_id` on each deploy (and
 * a `review_url` like .../pull/123), so the script fetches the PR directly
 * by number — no GitHub search API call is needed.
 *
 * Usage:
 *   pnpm tsx scripts/local/decline-stale-deploy-previews.ts                  # dry run (default, safe)
 *   pnpm tsx scripts/local/decline-stale-deploy-previews.ts --apply          # actually cancel deploys
 *   pnpm tsx scripts/local/decline-stale-deploy-previews.ts --apply --limit 5 # cancel only the first 5, then stop
 *   pnpm tsx scripts/local/decline-stale-deploy-previews.ts --verbose        # log every deploy considered
 *
 * Required env (.env):
 *   NETLIFY_AUTH_TOKEN   — Netlify personal access token
 *   NETLIFY_SITE_ID      — Netlify site id (Project ID)
 *   GITHUB_REPOSITORY    — e.g. "your-org/your-repo"
 *
 * Optional env:
 *   GITHUB_TOKEN         — raises GitHub rate limit from 60 to 5000 req/hour
 *
 * Run locally with: pnpm tsx scripts/local/decline-stale-deploy-previews.ts
 */

import dotenv from 'dotenv'
import minimist from 'minimist'

dotenv.config()

function requireEnv(name: string): string {
	const value = process.env[name]
	if (!value) {
		console.error(`❌ Missing required env var: ${name}`)
		process.exit(1)
	}
	return value
}

const SITE_ID = requireEnv('NETLIFY_SITE_ID')
const REPO = requireEnv('GITHUB_REPOSITORY')

const NETLIFY_TOKEN = requireEnv('NETLIFY_AUTH_TOKEN')
const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? ''

const argv = minimist(process.argv.slice(2), {
	boolean: ['apply', 'verbose', 'help'],
	alias: { h: 'help' }
})

const LIMIT = Number.isFinite(argv.limit) && argv.limit > 0 ? Number(argv.limit) : 0

if (argv.help) {
	console.log(
		[
			'Cancel stale/merged Netlify deploy previews from external contributors.',
			'',
			'Usage: pnpm tsx scripts/local/decline-stale-deploy-previews.ts [--apply] [--verbose] [--limit N]',
			'',
			'  --apply    Actually cancel deploys (default: dry run, no changes)',
			'  --verbose  Log every deploy considered, not just the ones acted on',
			'  --limit N  Stop after cancelling N deploys (default: 0 = no limit). Useful',
			'             for verifying a small batch with --apply before going all-in.',
			'  --help     Show this help'
		].join('\n')
	)
	process.exit(0)
}

const APPLY = argv.apply === true
const VERBOSE = argv.verbose === true

const NETLIFY_API = 'https://api.netlify.com/api/v1'
const GITHUB_API = 'https://api.github.com'

type NetlifyDeploy = {
	id: string
	branch: string
	commit_ref: string | null
	created_at: string
	state: string // e.g. 'pending_review', 'ready', 'building', 'error', 'rejected'
	pending_review_reason: string | null // e.g. 'sensitive-variables' when held for review
	review_id: number | null // PR number this deploy belongs to (matches review_url)
	title: string | null
	site_id: string
}

async function netlifyFetch<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${NETLIFY_API}${path}`, {
		...init,
		headers: {
			Authorization: `Bearer ${NETLIFY_TOKEN}`,
			...(init?.headers ?? {})
		}
	})
	if (!res.ok) {
		const body = await res.text()
		throw new Error(`Netlify API ${path} failed: ${res.status} ${res.statusText}\n${body}`)
	}
	return (await res.json()) as T
}

async function ghFetch<T>(path: string): Promise<T | null> {
	// The repo is public, so this works without a token (unauthenticated
	// requests are rate-limited to 60/hour per IP vs. 5000/hour with a token).
	const headers: Record<string, string> = {
		Accept: 'application/vnd.github+json',
		'X-GitHub-Api-Version': '2022-11-28',
		'User-Agent': 'netlify-deploy-preview-gate'
	}
	if (GITHUB_TOKEN) headers.Authorization = `Bearer ${GITHUB_TOKEN}`
	const res = await fetch(`${GITHUB_API}${path}`, { headers })
	if (!res.ok) return null
	return (await res.json()) as T
}

async function listPendingReviewDeploys(): Promise<NetlifyDeploy[]> {
	// The default /deploys listing EXCLUDES pending_review deploys — they
	// only surface with the server-side state filter. Page through all of
	// them (capped) so we have the full candidate set.
	const all: NetlifyDeploy[] = []
	let page = 1
	const MAX_PAGES = 10 // cap API calls; pending_review deploys may not auto-expire
	while (page <= MAX_PAGES) {
		const params = new URLSearchParams({
			per_page: '100',
			page: String(page),
			state: 'pending_review'
		})
		const batch = await netlifyFetch<NetlifyDeploy[]>(`/sites/${SITE_ID}/deploys?${params}`)
		if (batch.length === 0) break
		all.push(...batch)
		if (batch.length < 100) break
		page++
	}
	return all
}

async function cancelDeploy(deploy: NetlifyDeploy, reason: string): Promise<void> {
	if (VERBOSE || !APPLY) {
		console.log(
			`  🚫 ${APPLY ? 'cancelling' : '[dry-run] would cancel'} deploy ${deploy.id} ` +
				`(branch "${deploy.branch}", ${deploy.commit_ref?.slice(0, 7) ?? 'no-sha'}, ` +
				`${deploy.created_at}) — ${reason}`
		)
	}
	if (!APPLY) return
	// POST /api/v1/deploys/{deploy_id}/cancel — rejects a pending deploy request.
	await netlifyFetch(`/deploys/${deploy.id}/cancel`, { method: 'POST' })
}

const prCache = new Map<number, { merged: boolean; headSha: string | null } | null>()

async function getPrInfo(
	reviewId: number
): Promise<{ merged: boolean; headSha: string | null } | null> {
	// Netlify deploys carry the PR number as `review_id` (and a `review_url`
	// like .../pull/123), so we can hit the pulls API directly — no search
	// API needed. All deploys on a branch share the same PR, so cache by
	// review_id; each PR is fetched at most once. Works without a token for
	// public repos (rate-limited to 60/hour per IP vs. 5000/hour with a token).
	// We return BOTH the merge flag (condition 2) AND the PR head SHA
	// (condition 1), so a single fetch serves both checks.
	if (prCache.has(reviewId)) {
		return prCache.get(reviewId) ?? null
	}
	const pr = await ghFetch<{ merged: boolean; head: { sha: string } }>(
		`/repos/${REPO}/pulls/${reviewId}`
	)
	const info = pr ? { merged: pr.merged, headSha: pr.head?.sha ?? null } : null
	prCache.set(reviewId, info)
	return info
}

async function main(): Promise<void> {
	console.log(`Netlify deploy-preview gate — ${APPLY ? 'APPLY' : 'DRY RUN'} — site: ${SITE_ID}`)
	if (!GITHUB_TOKEN) {
		console.log(
			'GITHUB_TOKEN not set — using unauthenticated GitHub API for merged-PR detection (60 req/hour per IP).'
		)
	}

	const pending = await listPendingReviewDeploys()
	console.log(
		`Fetched ${pending.length} pending_review deploy(s) from Netlify ` +
			`(held for manual approval; reason field on each).`
	)

	console.log(`Found ${pending.length} deploy(s) in pending_review state (needs review).`)

	let cancelledCount = 0
	let consideredCount = 0

	for (const deploy of pending) {
		consideredCount++

		// Condition 2: PR merged. Netlify gives us the PR number directly
		// (review_id), so we skip the search API and fetch the PR by number.
		// Cached per review_id so each PR is fetched at most once. The same
		// fetch also gives us the PR head SHA for condition 1.
		if (deploy.review_id == null) {
			if (VERBOSE)
				console.log(
					`  ⏳ deploy ${deploy.id} on "${deploy.branch}" has no review_id ` +
						`(reason: ${deploy.pending_review_reason ?? 'unknown'}) — leaving it`
				)
			continue
		}

		const prInfo = await getPrInfo(deploy.review_id)

		let reason: string | null = null

		// Condition 2: PR merged → the whole review is moot.
		if (prInfo?.merged === true) {
			reason = `PR #${deploy.review_id} for branch "${deploy.branch}" was merged`
		}
		// Condition 1: a newer commit is the PR head. Compare commit SHAs
		// (NOT created_at timestamps): accepting an older commit creates a
		// new `ready` deploy record with a recent timestamp, which would
		// wrongly look "newer" than a genuinely-newer pending commit. By
		// comparing against the PR head SHA we instead cancel a pending
		// deploy only when the head commit is a DIFFERENT (newer) commit —
		// whether that head is itself pending or already accepted. So: if
		// the head is accepted, all earlier pending deploys get cancelled;
		// if the head is still pending, only it is left and older ones go.
		else if (prInfo?.headSha && deploy.commit_ref && prInfo.headSha !== deploy.commit_ref) {
			reason = `newer commit is PR head (${prInfo.headSha.slice(0, 7)} for "${deploy.branch}")`
		}

		if (!reason) {
			if (VERBOSE)
				console.log(
					`  ⏳ deploy ${deploy.id} on "${deploy.branch}" is the PR head ` +
						`(${deploy.commit_ref?.slice(0, 7) ?? 'no-sha'}, reason: ${deploy.pending_review_reason ?? 'unknown'}) — leaving it`
				)
			continue
		}

		await cancelDeploy(deploy, reason)
		cancelledCount++

		// --limit N: stop after cancelling N deploys. Lets you verify a small
		// batch with --apply before going all-in. The limit counts only deploys
		// that were actually cancelled (not ones considered and left alone).
		if (LIMIT > 0 && cancelledCount >= LIMIT) {
			console.log(`\n--limit ${LIMIT} reached — stopping after ${cancelledCount} cancellation(s).`)
			break
		}
	}

	console.log(
		`\nDone. Considered ${consideredCount} pending_review deploy(s); ` +
			`${cancelledCount} ${APPLY ? 'cancelled' : 'would be cancelled'}.`
	)
	if (!APPLY && cancelledCount > 0) {
		console.log('Re-run with --apply to actually cancel them.')
	}
	if (APPLY && LIMIT > 0) {
		console.log(`Limit was ${LIMIT}. Re-run without --limit to process the remaining ones.`)
	}
}

main().catch((err) => {
	console.error('❌ Script failed:', err)
	process.exit(1)
})
