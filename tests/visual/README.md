# Visual diff — what it covers

Every PR gets a side-by-side visual diff via Playwright + Chromatic. The check is **informational** — it never blocks a merge, and reviewers can ignore it. A green check means "no layout-regression signal from this check," not "every code path was exercised."

## What's covered

- Every unique route template under `src/routes/` (auto-discovered by walking `+page.svelte` / `+page.ts`). A page can opt out with a `@visualDiffEnabled: false — reason` comment in its source file.
- A representative sample of markdown-post variants (banner image, link-heavy, long-form, etc.). Posts opt in with `<!-- @visualDiffEnabled: true — reason -->` below their frontmatter.
- Two viewports: desktop (1280×800) and Pixel 7 (412×839).

## What's NOT covered

- **Languages other than `en`.** The CI build uses `PARAGLIDE_LOCALES=en` by default. Locale-dependent layout regressions are invisible.
- **Individual post content.** A typo in a specific post's markdown won't show up — that's a content-review concern.
- **Pages that opt out.** `grep -rn "@visualDiffEnabled: false" src/routes/` lists them with their per-page reasons (admin tools, form flows, token-dependent pages, etc.).
- **Third-party widget internals.** Mapbox map tiles, Luma checkout, Tally forms — requests to these are aborted so their churny rendering doesn't produce noise. The _container_ and _surrounding layout_ are diffed; the widget contents are not.
- **New browser-side third-party embeds.** A new iframe or CDN script added to a page isn't automatically flagged for review — only Node-side (SSR/build) external requests are tracked via MSW. Inspect diffs visually when adding them.

## External data in CI

The workflow runs `pnpm build` without production secrets. Two interception mechanisms keep snapshots deterministic:

- **MSW-node** (`msw-setup.mjs`, loaded via `NPM_CONFIG_NODE_OPTIONS=--import` in the workflow) intercepts outbound HTTP from the Node process — Notion, Airtable, and Substack RSS — and serves pinned fixtures from `fixtures/`. Covers both build-time prerender (press, funding) and request-time SSR (about, statement, national-groups, `/api/news`). Catch-all handlers for Airtable + Notion return empty results for un-fixtured endpoints so new tables/databases fail deterministically instead of producing flaky real-network 401s. The trade-off: a page that depends on a new external integration will silently render its empty state until an explicit handler + fixture is added — review `msw-handlers.ts` whenever an integration lands.
- **Playwright `page.route()`** in `smoke.spec.ts` is reserved for **aborting** third-party widget requests (Tally, Mapbox, Luma) that originate in the browser and never touch our Node process. No fixture data is served at the browser boundary.

**What this means for reviewers:** snapshots show the app rendering against _fixtures_ that look representative but are not live data. A green diff on `/about` means "no layout regression given the fixture people list," not "the Airtable integration works."

When you change external-data shape (add/rename a field), update the matching fixture in `fixtures/` — otherwise the diff becomes misleading.

## When the diff shows N changes

Open Chromatic from the PR's check. It offers side-by-side viewers; accept or deny per snapshot. Accepted snapshots become the new baseline once the PR merges to `main`.

## How to change what's covered

- **Add a new route:** nothing to do — it's auto-discovered when `+page.svelte` / `+page.ts` appears.
- **Opt a page out:** add `<!-- @visualDiffEnabled: false — reason -->` (or `// @visualDiffEnabled: false — reason` in a `.ts` file) near the top of the page's source file. The comment lives with the page, so renames carry it along.
- **Opt a post in:** add `<!-- @visualDiffEnabled: true — reason -->` just below the post's frontmatter in `src/posts/<slug>.md`. Posts default to excluded (100+ would be too many); sample only posts covering distinct layout variants.
- **Add a new external-data integration:** add a handler in `msw-handlers.ts` with a fixture in `fixtures/`. Don't leave a new integration unmocked — without secrets in CI, it will either fail or produce non-deterministic snapshots. (`page.route()` is only for aborts, not for serving fixture data.)
