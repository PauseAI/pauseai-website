# PauseAI.es Website

A SvelteKit website for [PauseAI.es](https://pauseai.es/).

## Quick Start

```bash
# Clone the repository
git git@github.com:pauseai-en-espanol/pauseai-website-es.git
cd pauseai-website-es

# Install dependencies (we use pnpm, but npm or yarn also work)
pnpm install

# Start development server (es-only mode)
pnpm dev

# Open http://localhost:37572
```

That's it! By default, all commands run in Spanish-only mode for maximum speed. No API keys or special setup required.

## Development Commands

| Command        | Description                      |
| -------------- | -------------------------------- |
| `pnpm dev`     | Start development server         |
| `pnpm build`   | Build for production             |
| `pnpm preview` | Preview production build         |
| `pnpm test`    | Run test suite                   |
| `pnpm lint`    | Check code style                 |
| `pnpm format`  | Auto-fix code style              |
| `pnpm clean`   | Clean build artifacts and caches |
| `pnpm netlify` | Show Netlify preview options     |

## Docker

You can run the Spanish site inside a container without installing local dependencies.

```bash
# Build the image (only required once or after code changes)
docker build -t pauseai-site-es .

# Serve the production build on http://localhost:4173
docker run --rm -it -p 3000:3000 pauseai-site-es
```

The image runs `pnpm preview`, so it expects the same conventions as Netlify: prerendered content plus edge function stubs. The build step sets `PARAGLIDE_LOCALES=es` by default; override it at runtime if you need to experiment with other locales.

The Docker build runs the l10n pipeline in offline mode and never contacts GitHub. Make sure the repository’s `l10n-cage/` directory contains the translations you want before building.

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

This fork vendors the Spanish cage inside the repo, so local workflows never talk to GitHub. When you need to refresh the cage from `github.com/PauseAI/paraglide`, run the l10n script with `L10N_REFRESH_REMOTE=1`:

```bash
L10N_REFRESH_REMOTE=1 pnpm l10n --dry-run
```

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

The `src/lib/redirects.ts` file defines server-side redirects for specific paths. This is useful for handling cases like old URLs or vanity URLs.

The `REDIRECTS` object maps incoming paths to their target paths. When a request comes in for a path defined in `REDIRECTS`, the `handleRedirects` function issues a 301 (Moved Permanently) redirect to the specified target.

Example:

```typescript
const REDIRECTS: Record<string, string> = {
	'/old-path': '/new-path',
	'/legacy-page': '/current-page'
}
```

To add a new redirect, simply add a new entry to the `REDIRECTS` object in `src/lib/redirects.ts`.

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
