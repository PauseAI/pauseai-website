<script lang="ts">
	import { enhance } from '$app/forms'
	import type { SigningModeResponse } from '$api/statement/sign/+server.js'
	import Combobox from '$lib/components/Combobox.svelte'
	import Link from '$lib/components/Link.svelte'
	import { COUNTRIES } from '$lib/components/onboarding/options'
	import Turnstile from '$lib/components/Turnstile.svelte'
	import type { SignatureField } from '$lib/server/statement'
	import { turnstileSiteKey } from '$lib/turnstile'
	import type { SubmitFunction } from '@sveltejs/kit'
	import { onMount, tick, type Snippet } from 'svelte'
	import StatementThanks from './StatementThanks.svelte'

	let {
		embedded = false,
		counter
	}: {
		/** The card is the whole page, as in the embed: it heads the page and has no margin. */
		embedded?: boolean
		counter?: Snippet
	} = $props()
	const headingLevel = $derived(embedded ? 1 : 2)

	let signed = $state(false)
	let submitting = $state(false)
	let errorMessage = $state('')
	type FieldErrors = Partial<Record<SignatureField, string>>
	let fieldErrors = $state<FieldErrors>({})

	// Assume live until the server says otherwise, so an unanswered request keeps the
	// anti-spam check required rather than dropping it. See OnboardingFlow.
	let mode = $state<SigningModeResponse['mode']>('live')
	// The widget waits for the answer, so a preview doesn't flash Turnstile's "could not
	// load" error before it's removed again.
	let modeKnown = $state(false)
	const UNAVAILABLE_MESSAGE =
		'Signing is unavailable right now. Please try again later, or email contact@pauseai.info.'
	onMount(async () => {
		try {
			const response = await fetch('/api/statement/sign')
			if (!response.ok) return
			const answer = (await response.json()) as SigningModeResponse
			mode = answer.mode
			// Say so before anyone types it all in. The server refuses regardless.
			if (mode === 'off') errorMessage = UNAVAILABLE_MESSAGE
		} catch {
			// Stay on the live assumption.
		} finally {
			modeKnown = true
		}
	})

	let turnstileToken = $state('')
	// Tokens are single-use: bumped after each post to remount the widget.
	let turnstileNonce = $state(0)
	// No widget to wait for without a configured site key (e.g. local dev).
	const needsTurnstile = $derived(mode === 'live' && !!turnstileSiteKey)
	// Why the button is disabled, for anyone who can't see the widget working.
	const waitingForTurnstile = $derived(!submitting && needsTurnstile && turnstileToken === '')
	const canSubmit = $derived(!submitting && !waitingForTurnstile)

	const GENERIC_ERROR = 'Something went wrong. Please try again.'

	// In the order they appear on the page.
	const FIELD_IDS = {
		name: 'statement-name',
		email: 'statement-email',
		country: 'statement-country',
		bio: 'statement-bio'
	} satisfies Partial<Record<SignatureField, string>>
	let errorSummary = $state<HTMLElement>()
	let thanks = $state<HTMLElement>()

	// Signing removes the form, and with it the button that had focus.
	async function focusThanks() {
		await tick()
		thanks?.focus()
	}

	async function focusFirstError() {
		await tick()
		const fields = Object.keys(FIELD_IDS) as (keyof typeof FIELD_IDS)[]
		const field = fields.find((key) => fieldErrors[key])
		const target = field ? document.getElementById(FIELD_IDS[field]) : errorSummary
		target?.focus()
	}

	// Deliberately never calls SvelteKit's update(), which would reset the form: on a failure
	// everything the person typed stays in the fields above.
	const submit: SubmitFunction = ({ cancel }) => {
		if (submitting) {
			cancel()
			return
		}
		submitting = true
		errorMessage = ''
		fieldErrors = {}
		return ({ result }) => {
			submitting = false
			turnstileToken = ''
			turnstileNonce += 1
			if (result.type === 'success' && result.data?.success) {
				signed = true
				void focusThanks()
			} else if (result.type === 'failure') {
				errorMessage = String(result.data?.message ?? GENERIC_ERROR)
				fieldErrors = (result.data?.fields as FieldErrors | undefined) ?? {}
				void focusFirstError()
			} else {
				errorMessage = GENERIC_ERROR
				void focusFirstError()
			}
		}
	}
</script>

<section class="card" class:embedded aria-labelledby="sign-heading">
	<svelte:element this={`h${headingLevel}`} id="sign-heading" class="heading"
		>Sign the statement</svelte:element
	>
	{@render counter?.()}

	{#if mode === 'dry_run'}
		<p class="test-notice">
			This is a test environment. Signatures are checked here, but not saved, and no email is sent.
		</p>
	{/if}

	<!-- Always in the page, as a live region only announces changes to one it already knows. -->
	<div class="thanks" role="status" tabindex="-1" bind:this={thanks}>
		{#if signed}
			<StatementThanks headingLevel={headingLevel === 1 ? 2 : 3} />
		{/if}
	</div>

	{#if !signed}
		<form method="POST" action="/statement/sign" use:enhance={submit}>
			<!-- Honeypot: real people leave this empty. -->
			<div class="field honey" aria-hidden="true">
				<label for="statement-nickname">Nickname</label>
				<input
					type="text"
					id="statement-nickname"
					name="nickname"
					tabindex="-1"
					autocomplete="off"
				/>
			</div>

			<div class="field">
				<label class="field-label" for="statement-name">Full Name *</label>
				<input
					type="text"
					id="statement-name"
					name="name"
					autocomplete="name"
					required
					maxlength="200"
					aria-invalid={!!fieldErrors.name}
					aria-describedby={fieldErrors.name ? 'statement-name-error' : undefined}
				/>
				{#if fieldErrors.name}
					<p class="field-error" id="statement-name-error">{fieldErrors.name}</p>
				{/if}
			</div>

			<label class="checkbox">
				<input type="checkbox" name="private" aria-describedby="statement-private-note" />
				<span>I want to be anonymous</span>
			</label>
			<p class="private-note" id="statement-private-note">
				Your name is hidden, but your country and anything you write below are still published, so
				leave out details that could identify you. See our
				<!-- A new tab, as leaving the page would lose what's been typed. -->
				<Link href="/privacy" target="_blank">privacy policy</Link>.
			</p>

			<div class="field">
				<label class="field-label" for="statement-email">Email *</label>
				<input
					type="email"
					id="statement-email"
					name="email"
					autocomplete="email"
					required
					maxlength="254"
					aria-invalid={!!fieldErrors.email}
					aria-describedby={fieldErrors.email ? 'statement-email-error' : undefined}
				/>
				{#if fieldErrors.email}
					<p class="field-error" id="statement-email-error">{fieldErrors.email}</p>
				{/if}
			</div>

			<div class="field">
				<label class="field-label" for="statement-country">Country of residence *</label>
				<Combobox
					id="statement-country"
					name="country"
					options={COUNTRIES}
					required
					placeholder="Select your country"
					invalid={!!fieldErrors.country}
					describedBy={fieldErrors.country ? 'statement-country-error' : undefined}
				/>
				{#if fieldErrors.country}
					<p class="field-error" id="statement-country-error">{fieldErrors.country}</p>
				{/if}
			</div>

			<div class="field">
				<label class="field-label" for="statement-bio">
					Share with the world who you are and why addressing AI risks is important to you
				</label>
				<textarea
					id="statement-bio"
					name="bio"
					rows="4"
					maxlength="2000"
					aria-invalid={!!fieldErrors.bio}
					aria-describedby={fieldErrors.bio ? 'statement-bio-error' : undefined}></textarea>
				{#if fieldErrors.bio}
					<p class="field-error" id="statement-bio-error">{fieldErrors.bio}</p>
				{/if}
			</div>

			{#if mode === 'live' && modeKnown}
				{#key turnstileNonce}
					<Turnstile bind:token={turnstileToken} />
				{/key}
			{/if}

			<!-- The field errors are repeated for screen readers, which can't see them highlighted. -->
			<div role="alert">
				{#if errorMessage}
					<p class="form-error" tabindex="-1" bind:this={errorSummary}>
						{errorMessage}
						{#each Object.entries(fieldErrors) as [field, fieldError] (field)}
							<span class="visually-hidden">{fieldError}</span>
						{/each}
					</p>
				{/if}
			</div>

			<button
				type="submit"
				disabled={!canSubmit}
				aria-describedby={waitingForTurnstile ? 'statement-submit-hint' : undefined}
				>{submitting ? 'Submitting…' : 'Submit'}</button
			>
			<div role="status">
				{#if waitingForTurnstile}
					<p class="submit-hint" id="statement-submit-hint">
						You can submit once the anti-spam check above has finished.
					</p>
				{/if}
			</div>
		</form>
	{/if}
</section>

<style>
	.card {
		box-sizing: border-box;
		margin: 2rem auto;
		padding: 2.25rem;
		width: 100%;
		max-width: 800px;
		background-color: var(--bg-subtle);
		border-radius: 32px;
		box-shadow: 0 4px 20px rgba(var(--black-rgb), 0.1);
	}

	.card.embedded {
		margin: 0 auto;
	}

	@media (max-width: 600px) {
		.card {
			padding: 1.5rem;
			border-radius: 24px;
		}
	}

	/* An h2's size at either level, so the card looks the same wherever it is. */
	.heading {
		margin: 0 0 1.25rem;
		font-size: 1.5rem;
	}

	/* Focused from code to carry on after the form goes, never reached by keyboard. */
	.thanks:focus {
		outline: none;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		width: 100%;
		/* The global `form` rule caps at 30rem, which would leave the card's width empty. */
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

	.field input,
	.field textarea {
		box-sizing: border-box;
		width: 100%;
		padding: 0.8rem 1.2rem;
		color: var(--text);
		font-family: var(--font-body);
		font-size: 1rem;
		background-color: var(--bg);
		border: 1px solid var(--brand-subtle);
		border-radius: 20px;
	}

	.field textarea {
		resize: vertical;
	}

	.field input:focus,
	.field textarea:focus {
		outline: 2px solid var(--brand);
		border-color: transparent;
	}

	.field > input[aria-invalid='true'],
	.field > textarea[aria-invalid='true'] {
		border: 2px solid var(--lookup-error);
	}

	/* Honeypot: visually hidden, still reachable for the rare bot that fills it. */
	.honey {
		position: absolute;
		left: -9999px;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}

	.checkbox {
		display: flex;
		/* Override the global `form label { flex-direction: column }`. */
		flex-direction: row;
		align-items: center;
		gap: 0.6rem;
		margin-left: 0.5rem;
		cursor: pointer;
	}

	.checkbox input {
		flex-shrink: 0;
		width: 1.1rem;
		height: 1.1rem;
		accent-color: var(--brand);
	}

	.field-error,
	.form-error {
		margin: 0;
		color: var(--text);
		font-weight: 500;
	}

	.field-error {
		margin-left: 0.5rem;
		font-size: 0.9rem;
	}

	.field-error::before {
		content: '⚠ ';
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.submit-hint,
	.test-notice,
	.private-note {
		margin: 0;
		font-size: 0.9rem;
	}

	/* Reads as part of the checkbox above, across the form's usual gap. */
	.private-note {
		margin-top: -0.6rem;
		margin-left: 0.5rem;
	}

	.test-notice {
		margin-bottom: 1rem;
		padding: 0.7rem 1rem;
		border-left: 4px solid var(--brand);
		background-color: var(--bg);
	}

	.form-error {
		padding: 0.7rem 1rem;
		border-left: 4px solid var(--brand);
		background-color: var(--bg);
	}

	/* Matches the onboarding form's primary button. */
	button {
		align-self: flex-start;
		padding: 0.8rem 3rem;
		color: white;
		font-family: var(--font-body);
		font-size: 1.1rem;
		font-weight: bold;
		background-color: var(--brand);
		border: none;
		border-radius: 50px;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	button:hover:not(:disabled) {
		opacity: 0.9;
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}
</style>
