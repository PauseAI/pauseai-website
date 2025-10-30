---
title: Join PauseAI
description: Sign up to join the PauseAI movement
---

<script>
    import { onMount } from 'svelte'
    import { page } from '$app/stores'
    import TallyEmbed from '$lib/components/TallyEmbed.svelte'
    import NewsletterSignup from '$lib/components/NewsletterSignup.svelte'
    import Banner from '$lib/components/Banner.svelte'
    import { detectAndStoreCollagenUid } from '$lib/collagen'

    let userHasUid = false

    onMount(() => {
        // Check for collagen UID in URL params or localStorage
        userHasUid = detectAndStoreCollagenUid('sayno', $page.url.searchParams)
    })
</script>

{#if userHasUid}
<Banner id="join-subscribed">
<strong>Thanks!</strong> We will subscribe you to our newsletter and keep you up to date. Want to do more? You can become an active member right now using the form below.
</Banner>
{/if}

This is our nuclear moment.
Rapid AI advancement represents one of history's most consequential and dangerous technological shifts.
We demand politicians and companies pause AGI development until international safety agreements are established.
Join our global network standing for democratic oversight of AI.

PauseAI Global unites concerned citizens—scientists, parents, students, workers, and community leaders—who believe transformative technologies require public input before they progress beyond human control.
Whether you can spare 5 minutes (sharing posts), an hour (flyering, writing letters), 5 hours (protests, meeting politicians) or 5 days weekly (strategy development), your voice matters.
After signing up, join our onboarding session online or locally to learn about current actions.

<TallyEmbed formId="wbGvKe" />

{#if !userHasUid}

## Stay Updated

<NewsletterSignup />
{/if}
