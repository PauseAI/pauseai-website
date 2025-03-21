# PauseAI.info website

[![Netlify Status](https://api.netlify.com/api/v1/badges/628797a4-8d5a-4b5f-94d7-236b4604b23c/deploy-status)](https://app.netlify.com/sites/pauseai/deploys)

SvelteKit website for [PauseAI.info](https://pauseai.info/).

## Creating Articles

You can create and edit articles using [Decap CMS](https://pauseai-cms.netlify.app/), a user-friendly web interface for managing content.

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

The article will be published automatically after approval.

## Running locally

```sh
git clone git@github.com:PauseAI/pauseai-website.git
# Copy the envs and set the variables if needed
cp template.env .env
# Instead of pnpm you could use npm or yarn
pnpm install
pnpm run dev
# Open http://localhost:37572
```

## Deployment

The contents of the repository are continuously deployed to Netlify. You can track the deployment status [here](https://app.netlify.com/sites/pauseai/deploys).
