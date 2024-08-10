# PauseIA.fr website

SvelteKit website for [PauseIA.fr](https://pauseia.fr/).

## Creating articles

[Create a new markdown file in `src/posts/`](https://github.com/moiri-gamboni/pauseai-france/new/main/src/posts)

Add a title, date and a description using frontmatter (optional, but recommended):

```
---
title: This will be shown as title in the browser / share previews / google results
description: This will be the description in the share previews / google results
date: '2023-4-14'
---

Here goes the content of the article.
```

Create a fork / open a pull request (follow the on screen instructions!)

The article will be published automatically when the pull request is merged.

## Running locally

1. [install nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#install--update-script).
2. [install pnpm with corepack](https://pnpm.io/installation#using-corepack).
3. Run:

```sh
git clone git@github.com:moiri-gamboni/pauseai-france.git
nvm install
# Copy the envs and set the variables if needed
cp template.env .env
pnpm install
pnpm run dev
# Open http://localhost:37572
```

Note:
While SvelteKit implements "[Zero-effort type safety](https://svelte.dev/blog/zero-config-type-safety)", the eslint-typescript plugin hasn't implemented this feature (see issue [#413](https://github.com/sveltejs/eslint-plugin-svelte/issues/413)) so you might see type inference errors in VSCode. When in doubt you can run `pnpm check` which will use SvelteKit features.

## Deployment

The contents of the repository are continuously deployed to Netlify. You can track the deployment status [here](https://app.netlify.com/sites/pauseai-france/deploys).

## Attribution

You can find all pages which have been translate from PauseAI (Global) in [`/TRANSLATIONS.md`](/TRANSLATIONS.md)
