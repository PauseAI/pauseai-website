---
name: news-system
description: How the Latest News homepage section works — adding news items, managing the API, and understanding the architecture.
---

# Latest News System

The homepage features a "Latest News" section that aggregates content from two sources:

1. **Internal posts** — Markdown files in `src/posts/` with `news: true` in frontmatter
2. **Substack RSS** — Automatically fetched from `https://pauseai.substack.com/feed`

## Architecture

```
src/routes/api/news/+server.ts    → API endpoint (fetches, merges, paginates)
src/lib/components/LatestNews.svelte → Section component (grid + pagination)
src/lib/components/NewsCard.svelte   → Individual card component
src/lib/types.ts                     → NewsItem type definition
```

### Data Flow

1. `LatestNews.svelte` fetches `/api/news?page=1&pageSize=6` on mount
2. The API endpoint runs `getInternalNews()` and `getSubstackNews()` in parallel
3. Results are merged, sorted by date (newest first), and paginated
4. The response includes `{ items, total, page, pageSize, totalPages }`

## How to Add an Internal News Item

Add `news: true` to any markdown post's frontmatter. Optionally add an `image` field for a banner:

```yaml
---
title: My News Post
description: A brief summary of the news.
date: 2026-02-18
image: /my-image.png
news: true
---
```

- The `image` will appear as a card thumbnail in the news grid AND as a banner on the post page
- Images should be placed in `static/` and referenced with a leading `/`
- Posts without `image` get an orange gradient fallback in the news grid
- The `description` field is used as the card subtitle

## How to Remove a News Item

Simply remove `news: true` from the post's frontmatter (or set it to `false`). The post will still exist as a regular page but won't appear in the news grid.

## API Endpoint Details

**`GET /api/news`**

| Param      | Default | Description             |
| ---------- | ------- | ----------------------- |
| `page`     | `1`     | Page number (1-indexed) |
| `pageSize` | `6`     | Items per page (max 12) |

The endpoint decodes HTML entities from Substack RSS (e.g., `&#8217;` → `'`).

## Key Design Decisions

- **No separate news page** — news lives directly on the homepage
- **3-column responsive grid** — 3 cols on desktop, 2 on tablet, 1 on mobile
- **External links** open in new tabs with `rel="noopener noreferrer"`
- **Internal links** navigate within the site (no new tab)
- The `NewsItem` type uses a discriminated union: items have either `slug` (internal) or `href` (external), never both
- The section title "Latest" uses `data-pagefind-ignore` to exclude it from site search

## Substack Integration

The Substack feed is fetched server-side from `https://pauseai.substack.com/feed`. Items are parsed from RSS XML using regex extraction for:

- `<title>` → card title
- `<description>` → card subtitle
- `<link>` → card href
- `<pubDate>` → card date
- `<enclosure url="...">` → card image

No Substack API key is needed — the RSS feed is public.
