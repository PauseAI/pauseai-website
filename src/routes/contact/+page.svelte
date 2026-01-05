<script lang="ts">
	import { enhance } from '$app/forms'
	import { toast } from 'svelte-french-toast'

	let activeTab: 'standard' | 'media' = 'standard'
	let loading = false

	function handleEnhance() {
		loading = true
		return async ({ result, update }: { result: any; update: () => Promise<void> }) => {
			loading = false
			if (result.type === 'success') {
				toast.success('Thank you for your message. We will get back to you soon.')
				update() // Reset the form
			} else if (result.type === 'failure') {
				toast.error(result.data?.message || 'Failed to send message.')
			} else {
				toast.error('An unexpected error occurred.')
			}
		}
	}
</script>

<svelte:head>
	<title>Contact Us | PauseAI</title>
	<meta name="description" content="Get in touch with the PauseAI team." />
</svelte:head>

<div class="contact-page">
	<h1>Contact Us</h1>
	<p class="intro">Get in touch with the PauseAI team</p>

	<div class="tabs">
		<button
			class="tab-button"
			class:active={activeTab === 'standard'}
			on:click={() => (activeTab = 'standard')}
		>
			General Inquiries
		</button>
		<button
			class="tab-button"
			class:active={activeTab === 'media'}
			on:click={() => (activeTab = 'media')}
		>
			Media & Press Inquiries
		</button>
	</div>

	<div class="form-container">
		{#if activeTab === 'standard'}
			<section id="standard-contact">
				<form method="POST" action="?/standard" use:enhance={handleEnhance}>
					<div class="field">
						<input type="text" id="std-name" name="name" required placeholder="Full Name" />
					</div>
					<div class="field">
						<input type="email" id="std-email" name="email" required placeholder="Email" />
					</div>
					<div class="field">
						<input type="text" id="std-subject" name="subject" required placeholder="Subject" />
					</div>
					<div class="field">
						<textarea id="std-message" name="message" required placeholder="Message"></textarea>
					</div>
					<button type="submit" disabled={loading}>
						{loading ? 'Sending...' : 'Send Message'}
					</button>
				</form>
			</section>
		{:else}
			<section id="media-contact">
				<form method="POST" action="?/media" use:enhance={handleEnhance}>
					<div class="field">
						<input type="text" id="med-name" name="name" required placeholder="Full Name" />
					</div>
					<div class="field">
						<input type="email" id="med-email" name="email" required placeholder="Email" />
					</div>
					<div class="field">
						<input type="text" id="med-subject" name="subject" required placeholder="Subject" />
					</div>
					<div class="field">
						<input
							type="text"
							id="med-org"
							name="organization"
							required
							placeholder="Organization"
						/>
					</div>
					<div class="field">
						<textarea id="med-details" name="details" required placeholder="Message"></textarea>
					</div>
					<button type="submit" disabled={loading}>
						{loading ? 'Sending...' : 'Send Message'}
					</button>
				</form>
			</section>
		{/if}
	</div>
</div>

<style>
	.contact-page {
		max-width: 800px;
		margin: 0 auto;
		padding: 0.5rem 0 2rem 0;
		color: var(--text);
	}

	h1 {
		font-family: var(--font-heading);
		font-size: 2.5rem;
		margin-bottom: 1rem;
		text-align: center;
	}

	.intro {
		text-align: center;
		margin-bottom: 1.5rem;
		font-size: 1.1rem;
		opacity: 0.8;
	}

	.tabs {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
		justify-content: center;
		border-bottom: 1px solid var(--brand-subtle);
		padding-bottom: 1rem;
	}

	.tab-button {
		background: none;
		border: none;
		padding: 0.5rem 1.5rem;
		font-size: 1.1rem;
		cursor: pointer;
		color: var(--text);
		opacity: 0.7;
		font-family: var(--font-body);
		transition: all 0.2s;
		border-radius: 30px;
	}

	.tab-button:hover {
		opacity: 1;
		background-color: var(--bg-subtle);
	}

	.tab-button.active {
		color: var(--brand);
		opacity: 1;
		font-weight: bold;
		background-color: var(--bg-subtle);
	}

	.form-container {
		background-color: var(--bg-subtle);
		padding: 2rem;
		border-radius: 32px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		width: 100%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}

	section,
	form {
		width: 100%;
		max-width: none;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 1rem;
	}

	.field {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}

	input,
	textarea {
		width: 100%;
		padding: 0.8rem 1.2rem;
		border: 1px solid var(--brand-subtle);
		border-radius: 20px;
		background-color: var(--bg);
		color: var(--text);
		font-family: var(--font-body);
		font-size: 1rem;
		font-weight: 300 !important;
		box-sizing: border-box;
		display: block;
	}

	input::placeholder,
	textarea::placeholder {
		font-weight: 300;
		opacity: 0.6;
	}

	input:focus,
	textarea:focus {
		outline: 2px solid var(--brand);
		border-color: transparent;
	}

	textarea {
		min-height: 200px;
		resize: vertical;
	}

	button[type='submit'] {
		background-color: var(--brand);
		color: white;
		border: none;
		padding: 0.8rem 3rem;
		border-radius: 50px;
		font-weight: bold;
		font-size: 1.1rem;
		cursor: pointer;
		transition: opacity 0.2s;
		width: fit-content;
		align-self: center;
		margin-top: 1rem;
	}

	button[type='submit']:hover:not(:disabled) {
		opacity: 0.9;
	}

	button[type='submit']:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: 600px) {
		.form-container {
			padding: 1.5rem;
		}

		.tabs {
			flex-direction: column;
			gap: 0.5rem;
		}
	}
</style>
