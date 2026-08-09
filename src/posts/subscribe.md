---
title: Get PauseAI updates
metaTitle: Get PauseAI updates
description: Sign up to get updates from PauseAI.
---

<script>
	import { onMount } from 'svelte'
	import { page } from '$app/state'
	import OnboardingFlow from '$lib/components/onboarding/OnboardingFlow.svelte'

	let subscribeEmail = ''
	onMount(() => {
		subscribeEmail = page.url.searchParams.get('subscribe-email') ?? ''
	})
</script>

Sign up to get PauseAI's campaign updates, actions, and news from your local group. You can also choose to get more involved.

<OnboardingFlow initialEmail={subscribeEmail} />
