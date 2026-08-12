---
title: Subscribe
metaTitle: Subscribe to PauseAI
description: Sign up to get updates from PauseAI.
---

<script>
	import { onMount } from 'svelte'
	import { page } from '$app/state'
	import SubscribeFlow from '$lib/components/onboarding/SubscribeFlow.svelte'

	let subscribeEmail = ''
	onMount(() => {
		subscribeEmail = page.url.searchParams.get('subscribe-email') ?? ''
	})
</script>

Sign up to our newsletter and receive updates about how to support our movement, from getting involved in the current campaign to taking part in a local event.

<SubscribeFlow initialEmail={subscribeEmail} />
