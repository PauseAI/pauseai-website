<script lang="ts">
	import { browser } from '$app/environment'
	import { enhance } from '$app/forms'
	import { toast } from 'svelte-french-toast'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	import Link from '$lib/components/Link.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { meta } from './meta'

	const { title, description } = meta

	let activeTab: 'media' | 'partnerships' | 'feedback' = 'partnerships'
	let loading = false
	let honeypot = ''

	let formData = {
		media: { name: '', email: '', subject: '', organization: '', details: '' },
		partnerships: {
			name: '',
			email: '',
			organization: '',
			city_country: '',
			partnership_type: '',
			other_partnership_type: '',
			message: ''
		},
		feedback: { name: '', email: '', subject: '', message: '' }
	}

	const partnershipOptions = [
		'Mobilize grassroots support for PauseAI’s mission',
		'Open a chapter in my city/country',
		'Organize a public demonstration or protest',
		'Support citizen lobbying efforts',
		'Invite Pause AI to participate/speak at your local event/meeting',
		'Test and refine policy proposals with policymakers',
		'Amplify Pause AI campaign and/or proposal',
		'Assist with surveys or qualitative data collection',
		'Help disseminate research findings to the public',
		'Connect Pause AI with experts',
		'Share grassroots public sentiment data',
		'Exchange volunteers for events or campaigns',
		'Pool resources for joint campaigns or event',
		'Collaborate on grant applications',
		'Co-create educational or advocacy content',
		'Mobilize volunteers for emergency response',
		'Adapt messaging for local/international contexts',
		'Connect with engaged volunteer base',
		'Explore general partnership opportunities',
		'Other'
	]

	function countWords(str: string) {
		return str.trim().split(/\s+/).length
	}

	function validatePartnershipForm() {
		if (activeTab !== 'partnerships') return true

		if (
			formData.partnerships.partnership_type === 'Other' &&
			countWords(formData.partnerships.other_partnership_type) > 10
		) {
			toast.error('Other partnership type must be 10 words or less.')
			return false
		}

		const messageWords = countWords(formData.partnerships.message)
		if (messageWords > 200) {
			toast.error(`Message must be 200 words or less. (Current: ${messageWords} words)`)
			return false
		}
		return true
	}

	onMount(() => {
		const tab = $page.url.searchParams.get('tab')
		if (tab === 'media') {
			activeTab = 'media'
		} else if (tab === 'partnerships') {
			activeTab = 'partnerships'
		} else if (tab === 'feedback') {
			activeTab = 'feedback'
		}

		if (browser) {
			const saved = localStorage.getItem('contactFormData')
			if (saved) {
				try {
					formData = { ...formData, ...JSON.parse(saved) }
				} catch (e) {
					console.error('Failed to parse saved form data', e)
				}
			}
		}
	})

	$: if (browser && formData) {
		localStorage.setItem('contactFormData', JSON.stringify(formData))
	}

	function handleEnhance({ cancel }: { cancel: () => void }) {
		if (activeTab === 'partnerships') {
			// Manually validate because we can't easily use the form state inside the enhancer
			// without potentially stale data if we just used `formData` variable.
			// But `formData` variable IS bound to inputs, so it should be fine.
			// However, `data` from the argument contains the actual FormData being submitted.

			if (!validatePartnershipForm()) {
				cancel()
				return
			}
		}

		loading = true
		return async ({
			result,
			update
		}: {
			result: import('@sveltejs/kit').ActionResult
			update: () => Promise<void>
		}) => {
			loading = false
			if (result.type === 'success') {
				toast.success("Thank you! We've received your message.")

				// Clear the data for the successfully submitted tab
				if (activeTab === 'media') {
					formData.media = { name: '', email: '', subject: '', organization: '', details: '' }
				} else if (activeTab === 'partnerships') {
					formData.partnerships = {
						name: '',
						email: '',
						organization: '',
						city_country: '',
						partnership_type: '',
						other_partnership_type: '',
						message: ''
					}
				} else if (activeTab === 'feedback') {
					formData.feedback = { name: '', email: '', subject: '', message: '' }
				}

				update() // Reset the form
			} else if (result.type === 'failure') {
				console.error('Submission failed:', result)
				toast.error(result.data?.message || 'Failed to send message.')
			} else {
				console.error('Unexpected result:', result)
				toast.error('An unexpected error occurred.')
			}
		}
	}
</script>

<PostMeta {title} {description} />

<div class="contact-page">
	<h1>{title}</h1>
	<p class="intro">Get in touch with the PauseAI team.</p>

	<div class="tabs">
		<button
			class="tab-button"
			class:active={activeTab === 'partnerships'}
			on:click={() => (activeTab = 'partnerships')}
		>
			Partnerships
		</button>
		<button
			class="tab-button"
			class:active={activeTab === 'media'}
			on:click={() => (activeTab = 'media')}
		>
			Press & Media
		</button>
		<button
			class="tab-button"
			class:active={activeTab === 'feedback'}
			on:click={() => (activeTab = 'feedback')}
		>
			Feedback
		</button>
	</div>

	<div class="form-container">
		{#if activeTab === 'partnerships'}
			<section id="partnerships-contact">
				<p class="tab-intro">
					Ready to collaborate with PauseAI's network to build the momentum required to drive
					meaningful change in AI policy? We would love to hear from you.
				</p>
				<form method="POST" action="?/partnerships" use:enhance={handleEnhance}>
					<div class="field">
						<input
							type="text"
							id="part-name"
							name="name"
							required
							placeholder="Full Name"
							bind:value={formData.partnerships.name}
						/>
					</div>
					<div class="field honey">
						<label for="part-nickname">Nickname</label>
						<input
							type="text"
							id="part-nickname"
							name="nickname"
							tabindex="-1"
							autocomplete="off"
							bind:value={honeypot}
						/>
					</div>
					<div class="field">
						<input
							type="email"
							id="part-email"
							name="email"
							required
							placeholder="Email"
							bind:value={formData.partnerships.email}
						/>
					</div>
					<div class="field">
						<input
							type="text"
							id="part-org"
							name="organization"
							placeholder="Organization (Optional)"
							bind:value={formData.partnerships.organization}
						/>
					</div>
					<div class="field">
						<input
							type="text"
							id="part-city"
							name="city_country"
							required
							placeholder="City, Country"
							bind:value={formData.partnerships.city_country}
						/>
					</div>
					<div class="field">
						<label for="part-type" class="field-label"
							>How would you like to partner with us? *</label
						>
						<select
							id="part-type"
							name="partnership_type"
							required
							bind:value={formData.partnerships.partnership_type}
						>
							<option value="" disabled selected>Select an option</option>
							{#each partnershipOptions as option}
								<option value={option}>{option}</option>
							{/each}
						</select>
					</div>

					{#if formData.partnerships.partnership_type === 'Other'}
						<div class="field">
							<input
								type="text"
								id="part-other"
								name="other_partnership_type"
								required
								placeholder="Enter details (max 10 words)"
								bind:value={formData.partnerships.other_partnership_type}
							/>
						</div>
					{/if}

					<div class="field">
						<label for="part-message" class="field-label">Details (max 200 words) *</label>
						<textarea
							id="part-message"
							name="message"
							required
							placeholder="Provide additional details to how you would like to partner with us, particularly if related to a time sensitive matter."
							bind:value={formData.partnerships.message}
						></textarea>
					</div>
					<button type="submit" disabled={loading}>
						{loading ? 'Sending...' : 'Send Message'}
					</button>
				</form>
			</section>
		{:else if activeTab === 'media'}
			<section id="media-contact">
				<p class="tab-intro">
					Looking for press materials or media coverage? Check out our <Link href="/press"
						>press page</Link
					>.
				</p>
				<form method="POST" action="?/media" use:enhance={handleEnhance}>
					<div class="field">
						<input
							type="text"
							id="med-name"
							name="name"
							required
							placeholder="Full Name"
							bind:value={formData.media.name}
						/>
					</div>
					<div class="field honey">
						<label for="med-nickname">Nickname</label>
						<input
							type="text"
							id="med-nickname"
							name="nickname"
							tabindex="-1"
							autocomplete="off"
							bind:value={honeypot}
						/>
					</div>
					<div class="field">
						<input
							type="email"
							id="med-email"
							name="email"
							required
							placeholder="Email"
							bind:value={formData.media.email}
						/>
					</div>
					<div class="field">
						<input
							type="text"
							id="med-subject"
							name="subject"
							required
							placeholder="Subject"
							bind:value={formData.media.subject}
						/>
					</div>
					<div class="field">
						<input
							type="text"
							id="med-org"
							name="organization"
							required
							placeholder="Organization"
							bind:value={formData.media.organization}
						/>
					</div>
					<div class="field">
						<textarea
							id="med-details"
							name="details"
							required
							placeholder="Message"
							bind:value={formData.media.details}
						></textarea>
					</div>
					<button type="submit" disabled={loading}>
						{loading ? 'Sending...' : 'Send Message'}
					</button>
				</form>
			</section>
		{:else if activeTab === 'feedback'}
			<section id="feedback-contact">
				<p class="tab-intro">
					We value your feedback! Let us know how we can improve or what you think about our work.
					Providing your name and email is optional.
				</p>
				<form method="POST" action="?/feedback" use:enhance={handleEnhance}>
					<div class="field">
						<input
							type="text"
							id="fb-name"
							name="name"
							placeholder="Full Name (Optional)"
							bind:value={formData.feedback.name}
						/>
					</div>
					<div class="field honey">
						<label for="fb-nickname">Nickname</label>
						<input
							type="text"
							id="fb-nickname"
							name="nickname"
							tabindex="-1"
							autocomplete="off"
							bind:value={honeypot}
						/>
					</div>
					<div class="field">
						<input
							type="email"
							id="fb-email"
							name="email"
							placeholder="Email (Optional)"
							bind:value={formData.feedback.email}
						/>
					</div>
					<div class="field">
						<input
							type="text"
							id="fb-subject"
							name="subject"
							required
							placeholder="Subject"
							bind:value={formData.feedback.subject}
						/>
					</div>
					<div class="field">
						<textarea
							id="fb-message"
							name="message"
							required
							placeholder="Your Feedback"
							bind:value={formData.feedback.message}
						></textarea>
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

	.tab-intro {
		margin-bottom: 1.5rem;
		font-size: 0.95rem;
		opacity: 0.9;
		line-height: 1.4;
	}

	.tab-intro :global(a) {
		color: var(--brand);
		font-weight: 500;
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

	select {
		width: 100%;
		padding: 0.8rem 1.2rem;
		border: 1px solid var(--brand-subtle);
		border-radius: 20px;
		background-color: var(--bg);
		color: var(--text);
		font-family: var(--font-body);
		font-size: 1rem;
		font-weight: 300;
		box-sizing: border-box;
		display: block;
		appearance: none;
		background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
		background-repeat: no-repeat;
		background-position: right 1rem center;
		background-size: 1em;
	}

	select:focus {
		outline: 2px solid var(--brand);
		border-color: transparent;
	}

	.field-label {
		margin-bottom: 0.5rem;
		margin-left: 0.5rem;
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text);
		opacity: 0.9;
	}

	.honey {
		display: none;
		opacity: 0;
		position: absolute;
		left: -9999px;
		height: 0;
		width: 0;
		overflow: hidden;
		z-index: -1;
	}
</style>
