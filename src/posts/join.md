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
We demand that politicians and companies pause AGI development until international safety agreements are established.
Join our global network standing for democratic oversight of AI.

PauseAI Global unites concerned citizens—scientists, parents, students, workers, and community leaders—who believe transformative technologies require public input before they progress beyond human control.
Whether you can spare 5 minutes (sharing posts), an hour (flyering, writing letters), 5 hours (protests, meeting politicians) or 5 days weekly (strategy development), your voice matters.
After signing up, join our onboarding session online or locally to learn about current actions.

<TallyEmbed formId="wbGvKe" />

## After signing up

Join one of our Member Community Welcome Meetings, or a local social event to find out more about PauseAI’s community: [Events](/communities#events).
If you want to get kick-started into action straight away, check out our [list of them](/action).

## Volunteer Vacancies

One of the ways you can get involved consistently as a volunteer is by joining one of our Digital teams - Onboarding, Communications and Software. The roles below cover some of our core functions and by getting involved, you can help us grow our reach, retain our volunteers or build the tools we need to win.

- We work in [teams](/teams)
- We collaborate mostly on our [Discord server](https://discord.gg/2XXWXvErfA)
- Read more about our [organization](/organization)

### Onboarding team member

- Minimum Duration: 3 months 
- Time Commitment: 2-5 hours per week
- Responsibilities:
  - Host our Community Welcome Calls once a fortnight.
  - Prepare introductory communications to new members on the PauseAI Global Discord, including follow-up. This may include one to one calls with new members, to discuss PauseAI’s mission and  assist them in finding out more about how they can contribute.

- Key Skills:
  - Friendly and welcoming. 
  - Understands PauseAI’s mission. 
  - A good social connector.

Interested? [Email Irina](mailto:irina@pauseai.info)

### Communications team member - Writing and Editing Newsletter and LinkedIn posts

- Duration: 3 months
- Time Commitment: 2-5 hours per week
- Responsibilities:
  - Drafting content for the PauseAI Global monthly newsletter and regular LinkedIn posting; including searching for relevant news and interviewing contributors. 

- Key Skills:
  - Strong written skills, ability to capture PauseAI tone and simply communicate complex information.
  - Proof-reading.

Interested? [Email Irina](mailto:irina@pauseai.info)

### Communications team member - Video Editor

- Duration: 3 months
- Time Commitment: 2-5 hours per week
- Responsibilities:
  - Creating video content for PauseAI Global's social media channels

- Key Skills:
  - Ability to capture PauseAI tone and simply communicate complex information.
  - Video editing

Interested? [Email Irina](mailto:irina@pauseai.info)

### Communications team member - Outreach to influencers and media

- Duration: 3 months
- Time Commitment: 2-5 hours per week
- Responsibilities:
  - Contacting key influencers and media contacts as a representative of PauseAI Global to secure podcast or video slots for CEO and National Directors.

- Key Skills:
  - Strong written skills, ability to capture PauseAI tone and simply persuasively.
  - Charisma and the ability to build and sell an idea.

Interested? [Email Irina](mailto:irina@pauseai.info)

### Software Team member

- Duration: 3 months
- Time Commitment: 2-5 hours per week
- Responsibilities:
  - Build and maintain features for the PauseAI website and other parts of our technology stack (tooling etc.)
  - Advise and assist other teams on technology choices. We have [unusual scaling requirements](https://tinyurl.com/pauseaitechandscaling), and we buy rather than build in most cases.

- Key Skills:
  - (Any of these can be learned: none are blockers to signing up.)
  - Web development (the main website is mostly static, using SvelteKit with clientside hydration, Node, Markdown, deployed through Netlify).
  - Self-directed and able to work asynchronously. Bias for action and ideas - we'll validate choices in review. All the usual challenges of open source development are amplified in a volunteer org context - previous experience in those helps.

Yes we are happy to use language models to accelerate our development.

Interested? [Email Anthony](mailto:mail@anthonybailey.net) (or DM anthonybailey.net on [Discord](https://discord.gg/2XXWXvErfA). Make sure you've signed the volunteer agreement!

## Stay Updated

<NewsletterSignup bind:email={newsletterEmail} />

{#if userHasUid && subscribeEmail}

<p><em>Consider becoming an active PauseAI member using the form above!</em></p>
{/if}
