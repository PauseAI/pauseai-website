---
title: Join PauseAI
description: Sign up to join the PauseAI movement
---

<!-- @visualDiffEnabled: true — markdown post with embedded Svelte components -->

<script>
    import TallyEmbed from '$lib/components/TallyEmbed.svelte'
    import NewsletterSignup from '$lib/components/NewsletterSignup.svelte'
    import CollagenSignup from '$lib/components/CollagenSignup.svelte'

    let newsletterEmail = ''
    let userHasUid = false
    let subscribeEmail = ''
</script>

<CollagenSignup bind:newsletterEmail bind:userHasUid bind:subscribeEmail />

This is our nuclear moment.
Rapid AI advancement represents one of history's most consequential and dangerous technological shifts.
We demand that politicians and companies pause AGI development until international safety agreements are established.
Join our global network standing for democratic oversight of AI.

PauseAI Global unites concerned citizens—scientists, parents, students, workers, and community leaders—who believe transformative technologies require public input before they progress beyond human control.
Whether you can spare 5 minutes (sharing posts), an hour (flyering, writing letters), 5 hours (protests, meeting politicians) or 5 days weekly (strategy development), your voice matters.
After signing up, join our onboarding session online or locally to learn about current actions.

<TallyEmbed formId="wbGvKe" />

## After signing up

Join one of our Member Community Welcome Meetings, or a local social event to find out more about PauseAI’s community: [Events](/communities#events).
If you want to get kick-started into action straight away, check out our [list of them](/action).

## Stay Updated

<NewsletterSignup bind:email={newsletterEmail} />

{#if userHasUid && subscribeEmail}

<p><em>Consider becoming an active PauseAI member using the form above!</em></p>
{/if}
