<!--
	SubscribeFlow — the lightweight newsletter entry at /subscribe.

	A single-step signup (global newsletter) with an optional local-group opt-in
	and an optional Substack opt-in. On success it offers to go further: rather
	than linking out to /join (which would create a second, duplicate record), it
	hands off to OnboardingFlow seeded at the intent step with the record already
	created here, so continuing updates that same record.
-->
<script lang="ts">
	import { enhance } from '$app/forms'
	import { afterNavigate } from '$app/navigation'
	import type { SubmitFunction } from '@sveltejs/kit'
	import { toast } from 'svelte-french-toast'
	import Combobox from '$lib/components/Combobox.svelte'
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'
	import OnboardingFlow from './OnboardingFlow.svelte'
	import { COUNTRIES } from './options'

	let {
		initialEmail = '',
		initialCountry = ''
	}: { initialEmail?: string; initialCountry?: string } = $props()

	type Phase = 'form' | 'thanks' | 'more'
	let phase = $state<Phase>('form')
	let submitting = $state(false)

	let fullName = $state('')
	let email = $state(initialEmail)
	let country = $state(initialCountry)
	let city = $state('')
	let wantsChapter = $state(false)
	let wantsSubstack = $state(false)
	let honeypot = $state('')
	let recordId = $state('')

	// Navigating to this page from itself — i.e. clicking "Subscribe" in the nav
	// while already here — would otherwise leave the finished flow on screen and
	// look like a dead link. Start over instead, cleared, so a second signup is a
	// deliberate act rather than one click away from duplicating the last one.
	// Only same-path navigations: arriving from elsewhere mounts this fresh, and
	// resetting there would wipe the ?subscribe-email hand-off.
	afterNavigate((nav) => {
		if (!nav.from || nav.from.url.pathname !== nav.to?.url.pathname) return
		phase = 'form'
		recordId = ''
		fullName = ''
		email = ''
		country = ''
		city = ''
		wantsChapter = false
		wantsSubstack = false
	})

	// A newsletter signup elsewhere (e.g. the homepage box) hands off here via
	// ?subscribe-email=...; that email arrives after mount. Apply it once into an
	// empty field, then never again — so it neither clobbers typed input nor
	// snaps back when the visitor clears it to fix a typo.
	let prefillApplied = $state(false)
	$effect(() => {
		if (prefillApplied || !initialEmail) return
		if (!email) email = initialEmail
		prefillApplied = true
	})

	const canSubmit = $derived(
		!submitting && !!fullName.trim() && !!email.trim() && !!country.trim() && !!city.trim()
	)

	const ERROR_MESSAGE = 'Something went wrong. Please try again.'

	const submit: SubmitFunction = () => {
		submitting = true
		return ({ result }) => {
			submitting = false
			if (result.type === 'success' && result.data?.success) {
				if (typeof result.data.recordId === 'string') recordId = result.data.recordId
				phase = 'thanks'
			} else if (result.type === 'failure') {
				toast.error(String(result.data?.message ?? ERROR_MESSAGE))
			} else {
				toast.error(ERROR_MESSAGE)
			}
		}
	}
</script>

<!-- The page-template h1 is suppressed (showTitle: false in subscribe.md) so the
     heading can track the phase: "Subscribe" for the signup, "Get involved" once
     they choose to do more (which reuses the /join flow). -->
<div class="subscribe-head">
	<h1>{phase === 'more' ? 'Get involved' : 'Subscribe'}</h1>
	{#if phase === 'form'}
		<p class="subscribe-intro">
			Sign up to our newsletter and receive updates about how to support our movement, from getting
			involved in the current campaign to taking part in a local event.
		</p>
	{/if}
</div>

{#if phase === 'form'}
	<div class="subscribe-card">
		<form method="POST" action="/embed/onboarding-form?/submit" use:enhance={submit}>
			<!-- Fixed for the newsletter entry: global newsletter opt-in, and the
			     privacy-policy consent is the act of signing up (see the microcopy
			     below). subscribe_form=1 tells the server to share with a chapter
			     only when the local-group box is ticked. -->
			<input type="hidden" name="subscribe_form" value="1" />
			<input type="hidden" name="mode" value="contact" />
			<input type="hidden" name="intent" value="Keep informed" />
			<input type="hidden" name="keep_informed" value="on" />
			<input type="hidden" name="agree_gdpr" value="on" />

			<!-- Honeypot: real people leave this empty. -->
			<div class="field honey" aria-hidden="true">
				<label for="sub-nickname">Nickname</label>
				<input
					type="text"
					id="sub-nickname"
					name="nickname"
					tabindex="-1"
					autocomplete="off"
					bind:value={honeypot}
				/>
			</div>

			<div class="field">
				<label class="field-label" for="sub-name">Name *</label>
				<input
					type="text"
					id="sub-name"
					name="full_name"
					placeholder="Your name"
					autocomplete="name"
					required
					bind:value={fullName}
				/>
			</div>

			<div class="field">
				<label class="field-label" for="sub-email">Email *</label>
				<input
					type="email"
					id="sub-email"
					name="email"
					placeholder="you@example.com"
					autocomplete="email"
					required
					bind:value={email}
				/>
			</div>

			<div class="field">
				<label class="field-label" for="sub-country">Country *</label>
				<Combobox
					id="sub-country"
					name="country"
					options={COUNTRIES}
					required
					placeholder="Select your country"
					bind:value={country}
				/>
			</div>

			<div class="field">
				<label class="field-label" for="sub-city">City *</label>
				<input
					type="text"
					id="sub-city"
					name="city"
					placeholder="Your city"
					autocomplete="address-level2"
					required
					bind:value={city}
				/>
			</div>

			<label class="opt-in">
				<input type="checkbox" name="chapter_share" bind:checked={wantsChapter} />
				<span>
					<span class="opt-in-label">Also send me updates from my local chapter</span>
					<span class="opt-in-sub">We'll connect you with your local PauseAI chapter.</span>
				</span>
			</label>

			<label class="opt-in">
				<input type="checkbox" name="newsletter" bind:checked={wantsSubstack} />
				<span>
					<span class="opt-in-label">Also subscribe me to the PauseAI Substack</span>
					<span class="opt-in-sub">AI news from the PauseAI team's perspective.</span>
				</span>
			</label>

			<div class="submit-group">
				<button class="primary" type="submit" disabled={!canSubmit}>
					{submitting ? 'Signing up…' : 'Sign up'}
				</button>
				<p class="submit-disclaimer">
					By signing up you agree to our
					<LinkWithoutIcon href="/privacy">Privacy Policy</LinkWithoutIcon>. We'll only use your
					details to keep you updated on PauseAI, and you can unsubscribe anytime.
				</p>
			</div>
		</form>
	</div>
{:else if phase === 'thanks'}
	<div class="subscribe-card thanks">
		<h2>Thanks for signing up!</h2>
		<p>
			Are you interested in doing more? Whether you have five minutes or five hours a week, there's
			a place for you.
		</p>
		<button class="primary" type="button" onclick={() => (phase = 'more')}>Get involved</button>
	</div>
{:else}
	<OnboardingFlow
		startStep={2}
		initialRecordId={recordId}
		initialFullName={fullName}
		initialEmail={email}
		initialCountry={country}
		initialCity={city}
		initialKeepInformed={true}
		initialChapterShare={wantsChapter}
	/>
{/if}

<style>
	/* Replaces the suppressed page-template hgroup; the global h1 rule supplies
	   the font/size, so only spacing lives here. */
	/* Mirrors the page template's hgroup rhythm (which subscribe.md suppresses via
	   showTitle), so the heading sits like every other page's: no space above, the
	   hgroup gap under the title, and the body text close to what follows. */
	.subscribe-head {
		margin: 0 0 1rem;
	}

	.subscribe-head h1 {
		margin: 0;
	}

	.subscribe-intro {
		margin: calc(0.83 * 3rem) 0 0;
		max-width: 40rem;
	}

	.subscribe-card {
		/* Inputs set width:100% with their own padding; the site's reset doesn't
		   cover form controls, so make width include padding or they overflow the
		   card on narrow screens. */
		box-sizing: border-box;
		background-color: var(--bg-subtle);
		border-radius: 32px;
		width: 100%;
		/* Matches OnboardingFlow's width: the "do more" step swaps this card for
		   that one in place, so a different width would jump mid-flow. */
		max-width: 800px;
		margin: 0 auto;
		padding: 2.25rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}

	@media (max-width: 600px) {
		.subscribe-card {
			padding: 1.5rem;
			border-radius: 24px;
		}
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		width: 100%;
		/* The global `form` rule caps at 30rem, which would leave the card's extra
		   width empty. */
		max-width: none;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.field-label {
		margin-left: 0.5rem;
		font-size: 0.9rem;
		font-weight: 500;
		opacity: 0.9;
	}

	.field input {
		box-sizing: border-box;
		border: 1px solid var(--brand-subtle);
		background-color: var(--bg);
		width: 100%;
		color: var(--text);
		font-family: var(--font-body);
		border-radius: 20px;
		padding: 0.8rem 1.2rem;
		font-size: 1rem;
	}

	.field input:focus {
		outline: 2px solid var(--brand);
		border-color: transparent;
	}

	/* Honeypot: visually hidden, still reachable for the rare bot that fills it. */
	.honey {
		position: absolute;
		left: -9999px;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}

	.opt-in {
		display: flex;
		/* Override the global `form label { flex-direction: column }` so the
		   checkbox sits beside its label, not above it. */
		flex-direction: row;
		align-items: flex-start;
		gap: 0.6rem;
		cursor: pointer;
	}

	.opt-in input[type='checkbox'] {
		margin-top: 0.25rem;
		width: 1.1rem;
		height: 1.1rem;
		accent-color: var(--brand);
		flex-shrink: 0;
	}

	.opt-in-label {
		display: block;
		font-weight: 500;
	}

	.opt-in-sub {
		display: block;
		font-size: 0.9rem;
		opacity: 0.75;
	}

	.submit-group {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		margin-top: 0.5rem;
	}

	button.primary {
		background-color: var(--brand);
		color: #fff;
		font-size: 1.1rem;
		font-weight: 700;
		font-family: var(--font-body);
		cursor: pointer;
		border: none;
		border-radius: 50px;
		align-self: center;
		width: fit-content;
		padding: 0.8rem 3rem;
		transition: opacity 0.2s;
	}

	button.primary:hover {
		opacity: 0.9;
	}

	button.primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.submit-disclaimer {
		text-align: center;
		opacity: 0.7;
		margin: 0.75rem 0 0;
		font-size: 0.85rem;
	}

	.thanks {
		text-align: center;
	}

	.thanks h2 {
		font-family: var(--font-heading);
		margin: 0 0 0.75rem;
	}

	.thanks p {
		margin: 0 auto 1.5rem;
		max-width: 40ch;
	}
</style>
