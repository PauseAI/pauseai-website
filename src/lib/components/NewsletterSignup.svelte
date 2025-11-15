<script lang="ts">
	import * as m from '$lib/paraglide/messages.js'
	import { tick } from 'svelte'

	// Localizable text
	export let placeholderText = m.newsletter_email_placeholder()
	export let buttonText = m.newsletter_button()
	export let headingText = m.newsletter_heading()
	export let descriptionText = m.newsletter_description()

	// State variable for email binding (for external use)
	export let email = ''

	// State for showing success message
	let showSuccess = false
	let formElement: HTMLFormElement

	const handleSubmit = async (e: Event) => {
		e.preventDefault()

		// Show success message immediately
		showSuccess = true

		// Clear the email field
		email = ''

		// Wait for Svelte to render the success message
		await tick()

		// Now submit the form to open new tab
		formElement.submit()
	}
</script>

<div class="newsletter-signup">
	<div class="newsletter-content">
		<h3>{headingText}</h3>
		<p>{descriptionText}</p>

		<!-- Direct POST to Substack API in new tab -->
		<form
			bind:this={formElement}
			action="https://pauseai.substack.com/api/v1/free"
			method="POST"
			target="_blank"
			on:submit={handleSubmit}
		>
			<div class="input-group">
				<input
					type="email"
					name="email"
					bind:value={email}
					placeholder={placeholderText}
					aria-label={placeholderText}
					required
					enterkeyhint="done"
				/>
				<input type="hidden" name="source" value="pauseai_website" />
				<button type="submit">{buttonText}</button>
			</div>
		</form>

		{#if showSuccess}
			<div class="message success">
				{m.newsletter_success()}
			</div>
		{/if}
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

	p:last-child {
		margin-bottom: 0;
	}

	.input-group {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
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
