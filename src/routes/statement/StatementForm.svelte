<script lang="ts">
	import { enhance } from '$app/forms'
	import type { OnboardingModeApiResponse } from '$api/onboarding-mode/+server'
	import Combobox from '$lib/components/Combobox.svelte'
	import { COUNTRIES } from '$lib/components/onboarding/options'
	import Turnstile from '$lib/components/Turnstile.svelte'
	import { turnstileSiteKey } from '$lib/turnstile'
	import type { SubmitFunction } from '@sveltejs/kit'
	import { onMount } from 'svelte'
	import StatementThanks from './StatementThanks.svelte'

	let name = $state('')
	let isPrivate = $state(false)
	let email = $state('')
	let country = $state('')
	let bio = $state('')

	let signed = $state(false)
	let submitting = $state(false)
	let errorMessage = $state('')
	let fieldErrors = $state<Record<string, string>>({})

	// Assume live until the server says otherwise, so an unanswered request keeps the
	// anti-spam check required rather than dropping it. See OnboardingFlow.
	let live = $state(true)
	// The widget waits for the answer, so a preview doesn't flash Turnstile's "could not
	// load" error before it's removed again.
	let modeKnown = $state(false)
	onMount(async () => {
		try {
			const response = await fetch('/api/onboarding-mode')
			if (!response.ok) return
			const mode = (await response.json()) as OnboardingModeApiResponse
			live = mode.live !== false
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
	const canSubmit = $derived(!submitting && (!turnstileSiteKey || turnstileToken !== '' || !live))

	const GENERIC_ERROR = 'Something went wrong. Please try again.'

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
			} else if (result.type === 'failure') {
				errorMessage = String(result.data?.message ?? GENERIC_ERROR)
				fieldErrors = (result.data?.fields as Record<string, string> | undefined) ?? {}
			} else {
				errorMessage = GENERIC_ERROR
			}
		}
	}
</script>

<section class="card" aria-labelledby="sign-heading">
	<h2 id="sign-heading">Sign the statement</h2>

	{#if signed}
		<div role="status">
			<StatementThanks />
		</div>
	{:else}
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
					bind:value={name}
				/>
				{#if fieldErrors.name}
					<p class="field-error" id="statement-name-error">{fieldErrors.name}</p>
				{/if}
			</div>

			<label class="checkbox">
				<input type="checkbox" name="private" bind:checked={isPrivate} />
				<span>I want to be anonymous</span>
			</label>

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
					bind:value={email}
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
					bind:value={country}
				/>
				{#if fieldErrors.country}
					<p class="field-error">{fieldErrors.country}</p>
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
					aria-describedby={fieldErrors.bio ? 'statement-bio-error' : undefined}
					bind:value={bio}></textarea>
				{#if fieldErrors.bio}
					<p class="field-error" id="statement-bio-error">{fieldErrors.bio}</p>
				{/if}
			</div>

			{#if live && modeKnown}
				{#key turnstileNonce}
					<Turnstile bind:token={turnstileToken} />
				{/key}
			{/if}

			{#if errorMessage}
				<p class="form-error" role="alert">{errorMessage}</p>
			{/if}

			<button type="submit" disabled={!canSubmit}>{submitting ? 'Submitting…' : 'Submit'}</button>
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

	@media (max-width: 600px) {
		.card {
			padding: 1.5rem;
			border-radius: 24px;
		}
	}

	h2 {
		margin: 0 0 1.25rem;
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

	.form-error {
		padding: 0.7rem 1rem;
		border-left: 4px solid var(--brand);
		background-color: var(--bg);
	}

	button {
		align-self: flex-start;
		padding: 0.6rem 1.5rem;
		color: white;
		font-size: 1rem;
		background-color: var(--brand);
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button:hover {
		background-color: var(--brand-dark);
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}
</style>
