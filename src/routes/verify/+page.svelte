<script lang="ts">
	import { onMount } from 'svelte'
	import { goto, replaceState } from '$app/navigation'
	import { page } from '$app/state'
	import toast from 'svelte-french-toast'
	import Link from '$lib/components/Link.svelte'
	import Processing from '$lib/components/Processing.svelte'

	const NEW_LINK_MAIL =
		'mailto:info@pauseai.info?subject=' +
		encodeURIComponent('New email verification link') +
		'&body=' +
		encodeURIComponent(
			'Hi, my verification link has expired. Please send me a new one. (Sent from the address I signed up with.)'
		)

	let errorMessage: string | undefined = $state()
	let expired = $state(false)

	onMount(async () => {
		// Take the link's query out of the address bar, and so out of history and of
		// anything an error report reads from the page's URL.
		const linkParameters = page.url.search.slice(1)
		replaceState(page.url.pathname, {})
		try {
			const response = await fetch('/api/verify', {
				method: 'POST',
				headers: { 'content-type': 'application/x-www-form-urlencoded' },
				body: linkParameters
			})
			if (response.ok) {
				toast.success('Your email has been verified!')
				void goto('/')
			} else if (response.status === 410) {
				expired = true
			} else {
				const errorText = await response.text()
				throw new Error(`Verification failed: ${errorText || response.statusText}`)
			}
		} catch (error) {
			if (error instanceof Error) errorMessage = error.message
			else errorMessage = 'Verification failed with unexpected error.'
			throw error
		}
	})
</script>

{#if expired}
	<h1>This link has expired</h1>
	<p>
		Verification links work for 90 days, and only for the email address they were sent to. This one
		is older than that, or the address on your signup has changed since.
	</p>
	<p>
		To get a new link, <Link href={NEW_LINK_MAIL}>email us at info@pauseai.info</Link> from the address
		you signed up with, and we will send you one.
	</p>
	<p>
		Questions about your data? See our <Link href="/privacy">privacy policy</Link> or write to
		<Link href="mailto:privacy@pauseai.info">privacy@pauseai.info</Link>.
	</p>
{:else}
	<Processing {errorMessage} />
{/if}
