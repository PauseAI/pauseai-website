---
title: Subscribe
metaTitle: Subscribe to PauseAI
description: Sign up to get updates from PauseAI.
showTitle: false
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

<SubscribeFlow initialEmail={subscribeEmail} />
