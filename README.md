# PauseAI.info Website

[![Netlify Status](https://api.netlify.com/api/v1/badges/628797a4-8d5a-4b5f-94d7-236b4604b23c/deploy-status)](https://app.netlify.com/sites/pauseai/deploys)

A SvelteKit website for [PauseAI.info](https://pauseai.info/) with automatic localization (l10n) support.

## What is Localization (L10n)?

Localization goes beyond simple translation — it adapts content for specific locales (e.g., `en`, `de`, sometimes more complicated combinations such as `en-US` or `fr-CA`). While translating text between languages is a major part of l10n, true localization also considers cultural context, regional preferences, and local conventions. This project can use LLMs to automatically generate locale-appropriate content.

If you are not yourself developing/changing the l10n system, you can let it run automatically.

If you make changes to translated components (e.g. footer, navbar), update the `messages` json files accordingly.

## Quick Start

```bash
# Clone the repository
git clone git@github.com:PauseAI/pauseai-website.git
cd pauseai-website

# Install dependencies (we use pnpm, but npm or yarn also work)
pnpm install

# Start development server (en-only mode)
pnpm dev

# Open http://localhost:37572
```

That's it! By default, all commands run in English-only mode for maximum speed. No API keys or special setup required.

## Development Commands

| Command                | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `pnpm clean`           | Clean build artifacts and caches                    |
| `pnpm inlang:settings` | Regenerate inlang localization settings             |
| `pnpm l10n`            | Run l10n manually (see [L10N.md](./L10N.md))        |
| `pnpm dev`             | Start development server                            |
| `pnpm build`           | Build for production                                |
| `pnpm netlify`         | Show Netlify preview options                        |
| `pnpm test`            | Run test suite                                      |
| `pnpm preview`         | Preview production build                            |
| `pnpm check`           | Run type checking for SvelteKit and scripts         |
| `pnpm check:watch`     | Watch and check SvelteKit code changes              |
| `pnpm lint`            | Check code style                                    |
| `pnpm format`          | Auto-fix code style                                 |
| `pnpm prepare`         | Set up Git hooks (runs automatically after install) |
| `pnpm sync`            | Sync SvelteKit generated files                      |

## Environment Setup - for l10n and some dynamic pages

To make some development choices, including seeing dynamic pages or l10ns locally, you'll have to set up your development environment.

- But **no `.env` is needed** for basic development
- **Dynamic content** (teams, chat, geo, email validation, write features) needs API keys but has fallbacks
- **Multiple locales** needs `PARAGLIDE_LOCALES` set, while **developing the l10n system itself** usually also needs an OpenRouter API key

Just start by copying the environment template. Comments in the template explain more about each option.

```bash
cp template.env .env
# then edit .env to add API keys and configure locales if required
```

## Creating Articles

You can create and edit most content using [Decap CMS](https://pauseai-cms.netlify.app/), a user-friendly web interface for managing content.

(Some special pages, including the homepage, require editing other Svelte content outside of the CMS.)

### Steps to Create a New Article:

1. Go to [pauseai-cms.netlify.app](https://pauseai-cms.netlify.app/).
2. Log in with a GitHub account.
3. If you are **not authorized to publish content independently**, Decap CMS will prompt you to **fork the repository** before making any changes. Confirm this to create your own copy of the content.
4. Click **"New Post"**.
5. Fill in the fields:
   - **Title**: Enter the title of your post.
   - **Slug**: Define a URL-friendly version of your title.
   - **Description (Optional)**: Provide a brief summary of the post.
   - **Image (Optional)**: Upload an image or insert an image URL.
   - **Author (Optional)**: Add your name if applicable.
   - **Date (Optional)**: Select the publication date, or use "Now" for the current date.
   - **Body**: Enter the main content.
6. Click **"Save"** to store your draft.
7. Update the status as needed:
   - **Draft**: The initial state, for work in progress.
   - **In Review**: Submit the article for review and approval.
   - **Ready**: The article is ready to be published.
8. Decap CMS will automatically create a pull request on GitHub to submit your changes for review.

The article (and automatic l10ns of same) will be previewable.

If you are sufficiently changing prominent text, consider inspecting relevant l10ns as well as the original.

### Image Optimization

To improve performance, images are automatically processed and delivered in multiple formats (e.g., WebP, AVIF) and resolutions. This is handled by the `Image` Svelte component, which optimizes images located in the `src/assets/images` directory.

#### Usage

To use optimized images, first, ensure your image file (e.g., `my-image.png`) is located within the `src/assets/images` directory. Then, choose one of the following methods to embed it:

- **In Markdown Files:** Use standard Markdown image syntax. The system will automatically process the image through the `Image` component. The path in the Markdown should be relative to `src/assets/images` and start with a forward slash `/`.

  Example:

  ```markdown
  ![A description of my image](/my-image.png)
  ```

  If your image is in a subdirectory, for example `src/assets/images/illustrations/another-image.jpg`, the path would be:

  ```markdown
  ![Another image description](/illustrations/another-image.jpg)
  ```

- **In Svelte Components:** If you need to use the `Image` component directly in a Svelte component, import it and pass the `src` prop relative to `src/assets/images` and starting with a forward slash `/`.

  Example:

  ```svelte
  <script>
  	import Image from '$lib/components/Image.svelte'
  </script>

  <Image src="/my-image.png" alt="A description of my image" />
  ```

## Redirects

The `src/lib/redirects.ts` file defines server-side redirects for specific paths. This is useful for handling cases like old URLs, vanity URLs, or temporary campaign links.

Two redirect types are supported:

- **`REDIRECTS`** - Permanent (301) redirects for old/moved content
- **`TEMPORARY_REDIRECTS`** - Temporary (302) redirects for campaigns, A/B tests, etc.

Both support internal paths and external URLs.

Example:

```typescript
/** Permanent redirects (301) */
const REDIRECTS: Record<string, string> = {
	'/old-path': '/new-path',
	'/legacy-page': '/current-page'
}

/** Temporary redirects (302) */
const TEMPORARY_REDIRECTS: Record<string, string> = {
	'/campaign': 'https://external-site.com/landing-page'
}
```

To add a new redirect, add an entry to the appropriate object in `src/lib/redirects.ts`.

## Latest News Section

The homepage includes a "Latest News" section that automatically pulls content from two sources:

1. **Internal posts** — Any Markdown post with `news: true` in its frontmatter
2. **Substack RSS** — Automatically fetched from `https://pauseai.substack.com/feed`

Items are merged, sorted by date (newest first), and displayed in a paginated 3-column grid.

### Adding a Post to the News Section

Add `news: true` to the post's frontmatter. Optionally include an `image` for the card thumbnail and post banner:

```yaml
---
title: My News Post
description: A brief summary shown as the card subtitle.
date: 2026-02-18
image: /my-image.png
news: true
---
```

- **For optimized images**: Place images in `src/assets/images/` and reference them with a leading `/` (e.g., `/my-image.png`). These will be automatically optimized into multiple formats (WebP, AVIF) and resolutions.
- **For static images**: Place images in the `static/` directory if they shouldn't be optimized.
- Posts without an `image` display an orange gradient fallback in the news grid
- The `description` field is used as the card subtitle
- To remove a post from news, delete `news: true` or set it to `false`

### News API

The news data is served from `GET /api/news` and supports pagination:

| Parameter  | Default | Description             |
| ---------- | ------- | ----------------------- |
| `page`     | `1`     | Page number (1-indexed) |
| `pageSize` | `6`     | Items per page (max 12) |

Response format: `{ items, total, page, pageSize, totalPages }`

## API Routes Registration

The [`/api/posts`](src/routes/api/posts/+server.ts) endpoint serves as a central registry for all content that needs to be available via API endpoints, including:

- All Markdown posts from `src/posts/` directory
- Hard-coded pages with metadata for SEO purposes

### Adding New SvelteKit Routes

When creating new SvelteKit routes (not Markdown posts) that need to be accessible via the API or included in site-wide functionality like sitemaps, RSS feeds, or search indexes, you **must** register them in the [`hardCodedPages`](src/routes/api/posts/+server.ts:15) array in [`src/routes/api/posts/+server.ts`](src/routes/api/posts/+server.ts).

#### Steps to Register a New Route:

1. **Create your SvelteKit route** in the `src/routes/` directory (e.g., `src/routes/my-page/+page.svelte`)

2. **Create a metadata object** that follows the `Post` type interface. This should include:
   - `title`: The page title
   - `description`: A brief description
   - `date`: Publication date (if applicable)
   - `tags`: Relevant tags
   - Any other fields required by the `Post` interface

3. **Add a meta export** in your route's directory (e.g., `src/routes/my-page/meta.ts`)

4. **Import and register the metadata** in [`src/routes/api/posts/+server.ts`](src/routes/api/posts/+server.ts):

   ```typescript
   import { meta as myPageMeta } from '../../my-page/meta'

   const hardCodedPages: Post[] = [
   	// ... existing entries
   	myPageMeta
   ]
   ```

#### Example Meta File:

```typescript
// src/routes/my-page/meta.ts
export const meta = {
	title: 'My New Page',
	description: 'Description of my new page',
	date: '2024-01-01',
	tags: ['example', 'new-page']
	// ... other Post interface fields
}
```

This registration ensures your route is included in:

- Sitemap generation ([`src/routes/sitemap.xml/+server.ts`](src/routes/sitemap.xml/+server.ts))
- RSS feed generation ([`src/routes/rss.xml/+server.ts`](src/routes/rss.xml/+server.ts))
- Posts listing ([`src/routes/posts/+page.ts`](src/routes/posts/+page.ts))
- Search indexing and other site-wide functionality

## Deployment

The contents of the repository are continuously deployed to Netlify when code is pushed.

You can track the deployment status [here](https://app.netlify.com/sites/pauseai/deploys).

## Troubleshooting

### Windows Developer Mode (for symlinks)

If you are developing on Windows and encounter permission errors when creating symlinks (e.g., during the build process), you may need to enable Windows Developer Mode. This is required for certain operations, including the creation of symbolic links.

To enable Developer Mode:

1.  Go to **Settings** > **Privacy & security** > **For developers**.
2.  Toggle the **Developer Mode** option to **On**.

### Node.js Version

Ensure you are using the correct Node.js version as specified in `.nvmrc`. Even if you have the correct version installed via `nvm`, you may need to enable it for your current shell session using `nvm use`.

## Collaboration

If you have write access to the repository, please use the **"Squash and merge"** option when merging pull requests. This helps keep the Git history clean and easy to follow.
