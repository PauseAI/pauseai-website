<script lang="ts">
	import Button from './Button.svelte'
	import Card from './Card.svelte'
	import UKMPEmailForm from './UKMPEmailForm.svelte'
	import LoadingSpinner from './LoadingSpinner.svelte'
	import Link from '$lib/components/Link.svelte'

	interface MP {
		email: string
		name: string
		salutation: string
		constituency: string
	}

	interface MPContactStatus {
		responded: boolean
	}

	let postcode = ''
	let userName = ''
	let mp: MP | null = null
	let contactStatus: MPContactStatus | null = null
	let loading = false
	let errorMessage = ''
	let errorType: 'validation' | 'not_found' | 'server_error' | 'network' | '' = ''

	async function lookupMP() {
		const trimmedPostcode = postcode.trim()
		const trimmedName = userName.trim()

		if (!trimmedPostcode) {
			errorMessage = 'Please enter a postcode'
			errorType = 'validation'
			return
		}

		if (!trimmedName) {
			errorMessage = 'Please enter your name'
			errorType = 'validation'
			return
		}

		loading = true
		errorMessage = ''
		errorType = ''
		mp = null
		contactStatus = null

		try {
			const response = await fetch('/api/uk-lookup-mp', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ postcode: trimmedPostcode })
			})

			const result = await response.json()

			if (result.success) {
				mp = result.mp
				contactStatus = result.contactStatus
			} else {
				// Handle different error types with appropriate messaging
				errorType = result.type || 'not_found'
				switch (result.type) {
					case 'validation':
						errorMessage = result.error
						break
					case 'not_found':
						errorMessage = result.error
						break
					case 'server_error':
						errorMessage = 'Something went wrong on our end. Please try again in a moment.'
						console.error('Server error:', result.error)
						break
					default:
						errorMessage = result.error || 'Failed to find MP for this postcode'
				}
			}
		} catch (err) {
			console.error('Network error:', err)
			errorMessage = 'Network error. Please check your connection and try again.'
			errorType = 'network'
		} finally {
			loading = false
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			lookupMP()
		}
	}
</script>

<div class="mp-lookup">
	<div class="input-section">
		<div class="input-group">
			<div class="input-field">
				<label for="name-input">Name</label>
				<input
					id="name-input"
					type="text"
					bind:value={userName}
					placeholder="Alex Morgan"
					class="name-input"
					class:error={errorMessage}
					on:keypress={handleKeyPress}
					disabled={loading}
				/>
			</div>
			<div class="input-field">
				<label for="postcode-input">Postcode</label>
				<input
					id="postcode-input"
					type="text"
					bind:value={postcode}
					placeholder="SW1A 1AA"
					class="postcode-input"
					class:error={errorMessage}
					on:keypress={handleKeyPress}
					disabled={loading}
				/>
			</div>
		</div>
		<div class="button-row">
			<Button on:click={lookupMP} disabled={loading || !postcode.trim() || !userName.trim()}>
				<span class="button-content">
					{#if loading}
						Looking up
						<LoadingSpinner size="small" color="currentColor" />
					{:else}
						Find My MP
					{/if}
				</span>
			</Button>
		</div>

		{#if errorMessage}
			<div
				class="error-message"
				class:validation-error={errorType === 'validation'}
				class:server-error={errorType === 'server_error'}
				class:network-error={errorType === 'network'}
			>
				{#if errorType === 'server_error' || errorType === 'network'}
					<span class="error-icon">⚠️</span>
				{/if}
				{errorMessage}
			</div>
		{/if}
	</div>

	{#if mp}
		<div class="results-section">
			<Card>
				<div class="mp-info">
					<h3>{mp.name}</h3>
					<p class="constituency">MP for {mp.constituency}</p>
					<Link href={`mailto:${mp.email}`} class="email-link">
						{mp.email}
					</Link>
				</div>
			</Card>

			{#if contactStatus?.responded}
				<div class="contact-status">
					<span class="status-icon">ℹ️</span>
					<strong>Already contacted:</strong> This MP has already contacted us about the letter.
				</div>
			{:else}
				<UKMPEmailForm {mp} userPostcode={postcode} {userName} />
			{/if}
		</div>
	{/if}
</div>

<style>
	.input-section {
		width: 100%;
		margin-bottom: 2rem;
	}

	.input-group {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		flex-wrap: wrap;
	}

	.input-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
		min-width: 150px;
	}

	.input-field label {
		font-weight: 500;
		color: var(--text);
		font-size: 0.9rem;
	}

	.button-row {
		display: flex;
		justify-content: flex-start;
		margin-top: 1rem;
		margin-bottom: 4rem;
	}

	.button-content {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.name-input,
	.postcode-input {
		padding: 0.75rem 1rem;
		border: 2px solid var(--brand);
		border-radius: 8px;
		font-size: 1rem;
		background: var(--bg);
		color: var(--text);
		transition: border-color 0.2s ease;
	}

	.name-input::placeholder,
	.postcode-input::placeholder {
		color: var(--text-muted);
		opacity: 0.2;
	}

	.name-input:focus,
	.postcode-input:focus {
		outline: none;
		border-color: var(--brand-dark);
	}

	.name-input.error,
	.postcode-input.error {
		border-color: #e53e3e;
	}

	.name-input:disabled,
	.postcode-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.error-message {
		padding: 0.75rem 1rem;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 500;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.error-message.validation-error {
		color: #d69e2e;
		background-color: #fef7e0;
		border: 1px solid #f6ad55;
	}

	.error-message.server-error {
		color: #e53e3e;
		background-color: #fed7d7;
		border: 1px solid #fc8181;
	}

	.error-message.network-error {
		color: #e53e3e;
		background-color: #fed7d7;
		border: 1px solid #fc8181;
	}

	/* Default error styling for not_found errors */
	.error-message:not(.validation-error):not(.server-error):not(.network-error) {
		color: #4a5568;
		background-color: #f7fafc;
		border: 1px solid #cbd5e0;
	}

	.error-icon {
		font-size: 1rem;
		flex-shrink: 0;
	}

	.contact-status {
		margin-bottom: 1.5rem;
		padding: 1rem;
		border-radius: 8px;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		border: 2px solid;
	}

	.contact-status:not(.signed):not(.declined) {
		background-color: #ebf8ff;
		border-color: #63b3ed;
		color: #2a4365;
	}

	.status-icon {
		font-size: 1.2rem;
	}

	.results-section {
		width: 100%;
		animation: fadeIn 0.3s ease-in;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.mp-info {
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		text-align: center;
		border: 3px solid var(--brand);
		border-radius: 8px;
		background: var(--bg-subtle);
	}

	.mp-info h3 {
		margin: 0rem 0 0.8rem 0;
		color: var(--text);
		font-size: 1.5rem;
		font-weight: 600;
	}

	.constituency {
		margin: 0 0 0.5rem 0;
		color: var(--text-muted);
		font-size: 1.1rem;
	}

	* :global(.email-link) {
		color: var(--brand);
		text-decoration: none;
		font-weight: 500;
		word-break: break-all;
	}

	* :global(.email-link:hover) {
		text-decoration: underline;
		color: var(--brand-dark);
	}

	@media (max-width: 640px) {
		.input-group {
			flex-direction: column;
		}

		.postcode-input {
			min-width: unset;
		}
	}
</style>
