# Image processing

This document explains how the different image-handling pieces fit together
in the current codebase.

## Overview

There are two distinct image pipelines, both converging on the same
`<Picture>` rendering primitive:

1. **Static assets** bundled under `src/assets/images/` — resolved at build
   time by Vite and `vite-imagetools`, surfaced to the client via server load
   functions.
2. **Remote / arbitrary images** — optimized at request time by Netlify's
   image CDN via `NetlifyImage.svelte`.

Both produce a `Picture`-shaped object (`{ sources, img }`) that the shared
`Picture.svelte` component renders into a `<picture>` tag with `avif` +
`webp` `<source>`s and a raster fallback.

## The `Picture` type

Defined in `vite-imagetools` and re-exported from `src/lib/types.ts`:

```ts
type Picture = {
	sources: Record<'avif' | 'webp' | string, string> // format → srcset
	img: { src: string; w: number; h: number }
}
```

This is the single shape every image path eventually produces. A _loose_
variant (`LoosePicture`, also defined in `src/lib/types.ts`) makes `img.w` /
`img.h` optional, so callers that don't know intrinsic dimensions (e.g.
`NetlifyImage`) don't have to fabricate them. `LoosePicture` is the type
accepted by `Picture.svelte`, `Image.svelte`, and `NetlifyImage.svelte`.

## Shared image config: `src/lib/image-config.ts`

Widths, formats, meta-image width, and quality are centralized here so the
Vite `?picture` and `?meta` pipelines and `NetlifyImage.svelte` stay in
sync. The file has no SvelteKit dependencies, so it can be imported from
`vite.config.ts` as well as app code.

## Server-only asset resolution: `src/lib/image.server.ts`

This module is `.server`-only. It uses three `import.meta.glob` calls over
`src/assets/images/**/*`:

| Glob                  | Query      | Returns                                                                    |
| --------------------- | ---------- | -------------------------------------------------------------------------- |
| `IMAGE_URLS`          | `?url`     | The Vite-resolved URL string for any asset                                 |
| `PICTURES`            | `?picture` | A `Picture` object (avif/webp/jpeg/png, widths 400–2400) for raster images |
| `METADATA_IMAGE_URLS` | `?meta`    | A single downscaled JPEG for social/SEO meta tags                          |

It exposes three resolvers:

- `resolveImageUrl(path)` — returns the Vite URL for an asset path, or the
  path unchanged if it isn't a bundled asset (e.g. an external URL).
- `resolvePicture(path)` — returns the `Picture` for an asset path, or
  `null`.
- `getPostMetaImageUrl(path)` — returns the meta-image URL (the 1200px JPEG)
  for a post's frontmatter `image`, falling back to `resolveImageUrl`.

Keeping this module server-only is the key constraint: the large glob map
never ships to the client. Server load functions call these resolvers and
pass only the resulting URLs/`Picture` objects across the boundary.

## Post image pipeline

Markdown posts (`src/posts/*.md` and `l10n-cage/md/<locale>/*.md`) can
reference images in two ways:

- The frontmatter `image` field (the banner).
- Inline `![alt](/path/to/asset)` images in the body.

### Collecting body images: `remark/remark-collect-images.js`

A remark plugin registered in `svelte.config.js`. It walks the MDAST tree,
collects every `image` node's URL, dedupes them, and writes the list to
`vFile.data.fm._images`. mdsvex then exports that as `metadata._images` on
the compiled module. It deliberately ignores HTML `<img>` tags and the
frontmatter `image` (the latter is already available as `metadata.image`).

### Resolving server-side: `src/routes/[slug]/post-images.server.ts`

`imagesForPost(locale, slug)` is called from `+page.server.ts`. It:

1. Imports the markdown module (via the shared `markdown.ts` helper) to
   read `metadata.image` and `metadata._images`.
2. Resolves the banner (`metadata.image`) into a `ResolvedImage`
   `{ picture, assetUrl }` — `picture` is `null` for non-asset URLs.
3. Resolves each body image in `metadata._images` the same way.
4. Computes the meta image URL via `getPostMetaImageUrl`.

Returns `{ banner, metaImageUrl, pictures }`, where `pictures` is a
`Record<src, ResolvedImage>` keyed by the original markdown `src`.

### Passing to the client: `+page.svelte`

- `+page.server.ts` returns `{ cssUrls, pictures, banner, metaImageUrl }`.
- `+page.svelte` calls `setPostPictures(data.pictures)` to push the map
  into Svelte context, and renders the banner via `<Image>` using
  `data.banner.picture` / `data.banner.assetUrl`.
- The markdown renderer's custom `<img>` component
  (`src/lib/components/custom/img.svelte`) reads the map back out with
  `getPostPictures()[src]` and forwards `picture` + resolved `assetUrl`
  to `<Image>`. Images not in the map (external URLs) fall back to
  `<Image>`'s plain `<img>` branch.

This is what keeps the glob resolver out of the client bundle: the client
only ever sees the already-resolved `Picture` objects and URLs.

## Rendering components (`src/lib/components/images/`)

### `Picture.svelte`

The shared primitive. Takes a `LoosePicture` and renders:

```svelte
<picture>
	{#each Object.entries(picture.sources) as [format, srcset]}
		<source type={`image/${format}`} {srcset} {sizes} />
	{/each}
	<img src={picture.img.src} width={picture.img.w} height={picture.img.h} ... />
</picture>
```

### `Image.svelte`

The general-purpose entry point. Accepts either a pre-resolved `picture`
(a `LoosePicture`) _or_ a plain `src` (external URL / already-resolved
asset URL). When a `picture` is present it delegates to `<Picture>`;
otherwise it renders a bare `<img>`.

It also handles the `aspectRatio` + `object-fit: cover` case: when a target
aspect ratio is supplied, it scales the `sizes` attribute by
`max(1, imgAr / targetAr)` so the browser picks a source wide enough to
cover the container after cropping.

### `NetlifyImage.svelte`

For remote / arbitrary images that aren't bundled assets. It builds
`/.netlify/images?url=...&w=...&q=...&fm=...&fit=...` URLs for each width
in `avif` and `webp` srcsets plus a JPEG fallback, assembles them into a
`Picture`-shaped object, and hands it to `<Picture>`. If the optimized
variants fail to load it falls back to the raw `src` via an `onerror`
handler.

## Vite configuration

`vite.config.ts` registers a `vite-imagetools` instance with a
`defaultDirectives` hook. Two query shorthands are supported, both driven by
`image-config.ts`:

- `?picture` → `as=picture` with `imageFormats` and `imageWidths` (for
  responsive `<picture>` rendering).
- `?meta` → a single `metaImageWidth`-wide JPEG at `imageQuality` (for
  social/SEO meta tags).

The width list matches `NetlifyImage`'s defaults so the two pipelines emit
comparable srcsets.

## News API

`src/routes/api/news/+server.ts` resolves the `picture` for each internal
news item's `image` (when it points at a static asset) using
`resolvePicture`, and attaches it to the `NewsItem` payload. This keeps the
news listing client free of the glob resolver for the same reason as the
post pipeline. External items (Substack RSS, press coverage) carry only the
raw `image` URL — `picture` stays `null` for those.

### Consuming the API

`LatestNews.svelte` fetches `/api/news` and renders each `NewsItem` via
`NewsCard.svelte`, which picks the rendering component based on the item's
source:

- **Internal items** carry a server-resolved `picture`, so they go through
  `<Image>` (which delegates to `<Picture>`).
- **External items** (Substack, press) only have a raw URL, so they go
  through `<NetlifyImage>`.

## Quick reference

| You have…                                            | Use                                                                       |
| ---------------------------------------------------- | ------------------------------------------------------------------------- |
| A bundled asset path in a server load                | `resolvePicture` / `resolveImageUrl` from `$lib/image.server`             |
| A post banner / body image                           | `imagesForPost` from `routes/[slug]/post-images.server`                   |
| A remote or arbitrary URL                            | `<NetlifyImage src={url} … />`                                            |
| A resolved `Picture` (or a plain URL fallback)       | `<Image picture={…} src={…} />`                                           |
| Just need to render a `Picture` object               | `<Picture picture={…} />`                                                 |
| A static asset imported directly in a `.svelte` file | `import foo from '$assets/…/foo.jpg?picture'` → `<Image picture={foo} />` |
