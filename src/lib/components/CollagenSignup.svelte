<script lang="ts">
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import NewsletterSignup from '$lib/components/NewsletterSignup.svelte'
	import Banner from '$lib/components/Banner.svelte'
	import Link from '$lib/components/Link.svelte'
	import { detectAndStoreCollagenUid } from '$lib/collagen'

	const campaign = 'sayno'

	export let userHasUid = false
	export let subscribeEmail = ''
	export let newsletterEmail = ''
	let subscribeClicked = false
	let hideSharing = false

	onMount(async () => {
		userHasUid = detectAndStoreCollagenUid(campaign, $page.url.searchParams)
		hideSharing = $page.url.searchParams.has('x002')
		subscribeEmail = $page.url.searchParams.get('subscribe-email') || ''
		if (userHasUid && subscribeEmail) {
			newsletterEmail = subscribeEmail
		}
	})

	function handleNewsletterClick(e: MouseEvent) {
		const target = e.target as HTMLElement
		if ((target as HTMLInputElement).type === 'submit' || target.closest('button[type="submit"]')) {
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
		<p>
			<strong>Help us grow:</strong>
			<Link href="/{campaign}/share">Share the {campaign} campaign with your networks</Link>
		</p>
	{/if}
{:else if userHasUid && !subscribeEmail}
	<Banner id="join-error">
		<strong>Sorry!</strong> We couldn't complete your subscription automatically. Please enter your email
		below to subscribe.
	</Banner>
	<NewsletterSignup />
{/if}
