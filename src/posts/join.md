---
title: Join PauseAI
description: Sign up to join the PauseAI movement
---

<script>
    import { onMount, tick } from 'svelte'
    import { page } from '$app/stores'
    import TallyEmbed from '$lib/components/TallyEmbed.svelte'
    import NewsletterSignup from '$lib/components/NewsletterSignup.svelte'
    import Banner from '$lib/components/Banner.svelte'
    import { detectAndStoreCollagenUid } from '$lib/collagen'

    const campaign = 'sayno' // Campaign name for collagen tracking

    let userHasUid = false
    let subscribeEmail = ''
    let newsletterEmail = ''
    let subscribeClicked = false
    let hideSharing = false

    onMount(async () => {
        // Check for collagen UID in URL params - this sets the cookie and triggers auto-subscribe
        userHasUid = detectAndStoreCollagenUid(campaign, $page.url.searchParams)

        // Check if x002 experiment parameter is present (control = hide sharing)
        hideSharing = $page.url.searchParams.has('x002')

        // Get the email parameter if provided (should be present when userHasUid is true)
        subscribeEmail = $page.url.searchParams.get('subscribe-email') || ''

        // If user came from collagen email with uid, pre-fill the form
        if (userHasUid && subscribeEmail) {
            // Pre-fill the newsletter form
            newsletterEmail = subscribeEmail
        }
    })

    // Track when subscribe is clicked
    function handleNewsletterClick(e) {
        // Check if the clicked element is the submit button or inside the form
        if (e.target.type === 'submit' || e.target.closest('button[type="submit"]')) {
            subscribeClicked = true
        }
    }
</script>

{#if userHasUid && subscribeEmail}
<Banner id="join-subscribed">
{#if !subscribeClicked}
<strong>Welcome collage member!</strong> Click Subscribe to join the newsletter.
{:else}
<strong>Thanks.</strong> Scroll down if you feel active already!
{/if}
</Banner>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={handleNewsletterClick}>
<NewsletterSignup bind:email={newsletterEmail} />
</div>

{#if !hideSharing}

<p><strong>Help us grow:</strong> <a href="/{campaign}/share">Share the {campaign} campaign with your networks</a></p>
{/if}

{:else if userHasUid && !subscribeEmail}
<Banner id="join-error">
<strong>Sorry!</strong> We couldn't complete your subscription automatically. Please enter your email below to subscribe.
</Banner>
<NewsletterSignup />
{/if}

This is our nuclear moment.
Rapid AI advancement represents one of history's most consequential and dangerous technological shifts.
We demand politicians and companies pause AGI development until international safety agreements are established.
Join our global network standing for democratic oversight of AI.

PauseAI Global unites concerned citizens—scientists, parents, students, workers, and community leaders—who believe transformative technologies require public input before they progress beyond human control.
Whether you can spare 5 minutes (sharing posts), an hour (flyering, writing letters), 5 hours (protests, meeting politicians) or 5 days weekly (strategy development), your voice matters.
After signing up, join our onboarding session online or locally to learn about current actions.

<TallyEmbed formId="wbGvKe" />

## After singing up

Join one of our Member Community Welcome Meetings, or a local social event to find out more about PauseAI’s community: [Events](/events). 
If you want to get kick-started into action straight away, check out our [list of them](/action).

## Stay Updated

<NewsletterSignup bind:email={newsletterEmail} />

{#if userHasUid && subscribeEmail}

<p><em>Consider becoming an active PauseAI member using the form above!</em></p>
{/if}
