<script lang="ts">
	// NewsletterSignup.svelte - Component for newsletter subscription
	import { browser } from '$app/environment'
	import { onMount } from 'svelte'
	import * as m from '$lib/paraglide/messages.js'

	// Localizable text
	export let placeholderText = m.newsletter_email_placeholder()
	export let buttonText = m.newsletter_button()
	export let headingText = m.newsletter_heading()
	export let descriptionText = m.newsletter_description()

	// State variables
	let email = ''
	let subscribeStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle'
	let errorMessage = ''

	// Handle form submission - direct to Substack's subscribe page
	const handleSubmit = () => {
		if (!email) return

		try {
			// This is Substack's recommended way for free tier publications
			// Open the subscribe page with the email pre-filled
			const substackUrl = new URL('https://pauseai.substack.com/subscribe')
			substackUrl.searchParams.append('email', email)
			substackUrl.searchParams.append('utm_source', 'website')

			// Open in new tab and show success in our UI
			window.open(substackUrl.toString(), '_blank')

			// Show success UI
			subscribeStatus = 'success'
			email = '' // Clear the email input
		} catch (error) {
			subscribeStatus = 'error'
			errorMessage = m.newsletter_error_network()
			console.error('Newsletter redirect error:', error)
		}
	}

	// Reset error state when email changes
	$: if (email && subscribeStatus === 'error') {
		subscribeStatus = 'idle'
		errorMessage = ''
	}
</script>

<div class="newsletter-signup">
	<div class="newsletter-content">
		<h3>{headingText}</h3>
		<p>{descriptionText}</p>

		<form on:submit|preventDefault={handleSubmit}>
			<div class="input-group">
				<input
					type="email"
					name="email"
					bind:value={email}
					placeholder={placeholderText}
					aria-label={placeholderText}
					required
				/>
				<button type="submit">
					{buttonText}
				</button>
			</div>

			<p class="note">{m.newsletter_disclaimer()}</p>

			{#if subscribeStatus === 'success'}
				<div class="message success">
					{m.newsletter_success()}
				</div>
			{:else if subscribeStatus === 'error'}
				<div class="message error">
					{errorMessage}
				</div>
			{/if}
		</form>
	</div>
</div>

<style>
	.newsletter-signup {
		background-color: var(--bg-subtle);
		border-radius: 8px;
		padding: 1.5rem;
		margin: 2rem 0;
		width: 100%;
		box-sizing: border-box;
	}

	.newsletter-content {
		max-width: 500px;
		margin: 0 auto;
	}

	h3 {
		margin-top: 0;
		margin-bottom: 0.5rem;
		font-family: var(--font-heading);
	}

	p {
		margin-bottom: 1.5rem;
	}

	.input-group {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.note {
		font-size: 0.85rem;
		margin-top: 0.5rem;
		opacity: 0.8;
		font-style: italic;
	}

	input {
		flex: 1;
		padding: 0.75rem 1rem;
		border: 1px solid var(--border);
		border-radius: 4px;
		font-size: 1rem;
	}

	button {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 4px;
		font-weight: bold;
		cursor: pointer;
		transition: opacity 0.2s;
		font-size: 1rem;
		background-color: var(--brand);
		color: var(--bg);
	}

	button:hover {
		opacity: 0.9;
	}

	button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.message {
		margin-top: 10px;
		padding: 8px;
		border-radius: 4px;
		font-size: 0.9rem;
	}

	.success {
		background-color: #e6f7e6;
		color: #2e7d32;
	}

	.error {
		background-color: #fdecea;
		color: #d50000;
	}

	@media (max-width: 600px) {
		.input-group {
			flex-direction: column;
		}

		input,
		button {
			box-sizing: border-box;
			width: 100%;
		}
	}
</style>
