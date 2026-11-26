<script lang="ts">
	import * as Sentry from '@sentry/svelte'
	import { afterNavigate, goto, replaceState } from '$app/navigation'
	import { page } from '$app/state'
	import {
		verificationConfirmedParameter,
		verificationNeedsClick,
		verificationParameter
	} from '$lib/config'
	import { StatusCodes } from 'http-status-codes'
	import toast from 'svelte-french-toast'
	import Button from '$lib/components/Button.svelte'
	import Link from '$lib/components/Link.svelte'
	import Processing from '$lib/components/Processing.svelte'
	import LinkProblem from './LinkProblem.svelte'
	import SignatureConfirmed from './SignatureConfirmed.svelte'

	const NEW_LINK_MAIL =
		'mailto:info@pauseai.info?subject=' +
		encodeURIComponent('New email verification link') +
		'&body=' +
		encodeURIComponent(
			'Hi, my verification link has expired. Please send me a new one. (Sent from the address I signed up with.)'
		)

	// The link is already gone from the address bar, so a reload cannot retry.
	const FAILED_MESSAGE =
		'Verification failed. Check your connection, then open the link from your email again.'

	type Status =
		'processing' | 'awaitingClick' | 'linkMissing' | 'notFound' | 'expired' | 'failed' | 'confirmed'
	let status: Status = $state('processing')
	let verificationStarted = false
	let linkParameters = ''

	// replaceState needs the router started. On a direct load onMount runs while
	// SvelteKit is still constructing the root component (in production that
	// crashes on `root.$set`), and the first afterNavigate runs just before
	// SvelteKit marks the router started, so wait one microtask after it.
	// afterNavigate also fires on every later navigation that keeps this page
	// mounted, but verification must run once: by then the link parameters are
	// gone from the URL, so a re-run would find no link.
	afterNavigate(() => {
		if (verificationStarted) return
		verificationStarted = true
		void start()
	})

	async function start() {
		// Take the link's query out of the address bar, and so out of history and of
		// anything an error report reads from the page's URL.
		linkParameters = page.url.search.slice(1)
		await Promise.resolve()
		// The strip is only hygiene: if it fails (say a SvelteKit upgrade changes
		// the router timing this relies on), report it and carry on with the
		// verification, which is the point of the page. redactLinkCredentials in
		// hooks.client.ts keeps the leftover credentials out of the error report.
		try {
			replaceState(page.url.pathname, {})
		} catch (error) {
			console.error('Failed to remove the verification link from the address bar:', error)
			Sentry.captureException(error)
		}
		// The strip above means a reload, a restored tab or Back lands here with no query.
		const params = new URLSearchParams(linkParameters)
		if (!params.get(verificationParameter)) status = 'linkMissing'
		else if (verificationNeedsClick(params)) status = 'awaitingClick'
		else if (await verify(linkParameters)) {
			toast.success('Your email has been verified!')
			void goto('/')
		}
	}

	async function confirm() {
		status = 'processing'
		if (await verify(`${linkParameters}&${verificationConfirmedParameter}=true`))
			status = 'confirmed'
	}

	// Never throws: start() and confirm() leave rejections unhandled.
	async function verify(body: string): Promise<boolean> {
		try {
			const response = await fetch('/api/verify', {
				method: 'POST',
				headers: { 'content-type': 'application/x-www-form-urlencoded' },
				body
			})
			if (response.ok) return true
			const code: StatusCodes = response.status
			if (code === StatusCodes.GONE) status = 'expired'
			else if (code === StatusCodes.BAD_REQUEST || code === StatusCodes.NOT_FOUND)
				status = 'notFound'
			else {
				// A gateway error from Netlify never reached the function, so nothing
				// server-side reports it.
				if (code >= StatusCodes.INTERNAL_SERVER_ERROR)
					Sentry.captureMessage(`Verification failed with HTTP ${code}`, {
						level: 'error',
						fingerprint: ['verify', 'http', String(code)]
					})
				status = 'failed'
			}
		} catch (error) {
			Sentry.captureException(error)
			status = 'failed'
		}
		return false
	}
</script>

{#if status === 'confirmed'}
	<SignatureConfirmed />
{:else if status === 'awaitingClick'}
	<h1>Confirm your signature</h1>
	<p>
		Please confirm that you signed the PauseAI statement with this email address. Your signature is
		listed after you confirm, under your name unless you chose to be anonymous.
	</p>
	<Button onclick={confirm}>Confirm my signature</Button>
	<p class="not-you">Didn't sign it? Just close this page, and nothing will be published.</p>
{:else if status === 'linkMissing'}
	<LinkProblem reason="missing" />
{:else if status === 'notFound'}
	<LinkProblem reason="notFound" />
{:else if status === 'expired'}
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
	<Processing errorMessage={status === 'failed' ? FAILED_MESSAGE : undefined} />
{/if}

<style>
	.not-you {
		margin-top: 1rem;
	}
</style>
