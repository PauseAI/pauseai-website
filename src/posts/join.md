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

    let userHasUid = false
    let subscribeEmail = ''
    let newsletterEmail = ''

    onMount(async () => {
        // Check for collagen UID in URL params - this sets the cookie and triggers auto-subscribe
        userHasUid = detectAndStoreCollagenUid('sayno', $page.url.searchParams)

        // Get the email parameter if provided (should be present when userHasUid is true)
        subscribeEmail = $page.url.searchParams.get('subscribe-email') || ''

        // If user came from collagen email with uid, auto-subscribe them
        if (userHasUid && subscribeEmail) {
            // Pre-fill the newsletter form
            newsletterEmail = subscribeEmail

            // Wait for everything to render
            await tick()

            // Auto-submit after 2 seconds so user sees the banner message
            setTimeout(() => {
                const form = document.querySelector('.newsletter-signup form')
                if (form) {
                    form.submit()
                }
            }, 2000)
        }
    })
</script>

{#if userHasUid && subscribeEmail}
<Banner id="join-subscribed">
<strong>Thanks!</strong> We're subscribing {subscribeEmail} to our newsletter now. Want to do more? You can become an active member right now using the form below.
</Banner>
{:else if userHasUid && !subscribeEmail}
<Banner id="join-error">
<strong>Sorry!</strong> We couldn't complete your subscription automatically. Please use the form below to subscribe.
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

## Stay Updated

<NewsletterSignup bind:email={newsletterEmail} />

{#if userHasUid && subscribeEmail}

<p><em>Consider becoming an active PauseAI member using the form above!</em></p>
{/if}
