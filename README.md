# PauseAI.info website

SvelteKit website for [PauseAI.info](https://pauseai.info/).

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

```sh
git clone git@github.com:moiri-gamboni/pauseai-france.git
# Copy the envs and set the variables if needed
cp template.env .env
# Instead of pnpm you could use npm or yarn
pnpm install
pnpm run dev
# Open http://localhost:37572
```

## Deployment

The contents of the repository are continuously deployed to Netlify. You can track the deployment status [here](https://app.netlify.com/sites/pauseai/deploys).
