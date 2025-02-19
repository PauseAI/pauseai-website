# PauseAI.info website

[![Netlify Status](https://api.netlify.com/api/v1/badges/628797a4-8d5a-4b5f-94d7-236b4604b23c/deploy-status)](https://app.netlify.com/sites/pauseai/deploys)

SvelteKit website for [PauseAI.info](https://pauseai.info/).

## Creating articles

[Create a new markdown file in `src/posts/`](https://github.com/joepio/pauseai/new/main/src/posts)

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
git clone git@github.com:PauseAI/pauseai-website.git
# Copy the envs and set the variables if needed. Read the template.env file for more information.
cp template.env .env
# Instead of pnpm you could use npm or yarn
pnpm install
# Run the development server
pnpm run dev
# Open http://localhost:37572
```

## Deployment

The contents of the repository are continuously deployed to Netlify. You can track the deployment status [here](https://app.netlify.com/sites/pauseai/deploys).

## Translations

The website is localized using LLMs, see `/scripts/translation` for details and configuration.
We cache the translations in a [git repository](https://github.com/PauseAI/paraglide).

Note that especially if you are working on the localization machinery itself, you should clone a copy of the cache repos and point your local env GIT_REPO_PARAGLIDE variable at that - we don't want changes to the main repos in the course of local development 

Adding a language is as simple as going to the `project.inlang/settings.json` file and adding the language tag to the `languageTags` array.


```sh
# Create localizations, this can take a while!
pnpm run translate
```
