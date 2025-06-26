# PauseAI.info Website

[![Netlify Status](https://api.netlify.com/api/v1/badges/628797a4-8d5a-4b5f-94d7-236b4604b23c/deploy-status)](https://app.netlify.com/sites/pauseai/deploys)

A SvelteKit website for [PauseAI.info](https://pauseai.info/) with automatic localization (l10n) support.

## What is Localization (L10n)?

Localization goes beyond simple translation — it adapts content for specific locales (e.g., `en`, `de`, sometimes more complicated combinations such as `en-US` or `fr-CA`). While translating text between languages is a major part of l10n, true localization also considers cultural context, regional preferences, and local conventions. This project can use LLMs to automatically generate locale-appropriate content.

If you are not yourself developing/changing the l10n system, you can let it run automatically.

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

### Windows Developer Mode (for symlinks)

If you are developing on Windows and encounter permission errors when creating symlinks (e.g., during the build process), you may need to enable Windows Developer Mode. This is required for certain operations, including the creation of symbolic links.

To enable Developer Mode:

1.  Go to **Settings** > **Privacy & security** > **For developers**.
2.  Toggle the **Developer Mode** option to **On**.

## Development Commands

| Command        | Description                                  |
| -------------- | -------------------------------------------- |
| `pnpm dev`     | Start development server                     |
| `pnpm build`   | Build for production                         |
| `pnpm preview` | Preview production build                     |
| `pnpm test`    | Run test suite                               |
| `pnpm lint`    | Check code style                             |
| `pnpm format`  | Auto-fix code style                          |
| `pnpm clean`   | Clean build artifacts and caches             |
| `pnpm l10n`    | Run l10n manually (see [L10N.md](./L10N.md)) |
| `pnpm netlify` | Show Netlify preview options                 |

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

## Deployment

The contents of the repository are continuously deployed to Netlify when code is pushed.

You can track the deployment status [here](https://app.netlify.com/sites/pauseai/deploys).

## Collaboration

If you have write access to the repository, please use the **"Squash and merge"** option when merging pull requests. This helps keep the Git history clean and easy to follow.
