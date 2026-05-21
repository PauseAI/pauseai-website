<script lang="ts">
	import type { UKSendMPEmailApiResponse } from '$api/uk-send-mp-email/+server'
	import { micromark } from 'micromark'
	import LoadingSpinner from './LoadingSpinner.svelte'
	import Link from '$lib/components/Link.svelte'

	interface Props {
		mp: {
			name: string
			email: string
			salutation: string
			constituency: string
		}
		userPostcode: string
		userName: string
		onsubmit?: (e: SubmitEvent) => void
	}

	let { mp, userPostcode, userName, onsubmit }: Props = $props()

	let senderName = $derived(userName)
	let senderEmail = $state('')
	let subject = $state(`Request to co-sign letter on AI liability`)
	let message = $derived(`Dear ${mp.salutation},

Would you be willing to sign this open letter supporting legislation to hold AI companies accountable when their models cause severe harm?

I’m a resident of ${mp.constituency} and a supporter of **PauseAI**, a civic movement focused on minising the risks of advanced AI. I am very concerned that AI development is racing ahead without adequate protection for the public.

**Existing UK law does not reliably hold AI developers liable for damage or deaths caused by their models**, even when the danger is predictable, severe and uniquely enabled by the model. To ensure our safety, the incentives of AI developers must be aligned with the public interest.

Next steps
 - 30-min call. Let me know what time would work for you.
 - Alternatively, please review the letter and briefing attached and send over any questions or concerns.

Thank you for your consideration,

${userName}

${userPostcode.toUpperCase()}`)

	let messageTextarea: HTMLTextAreaElement | undefined = $state()
	let subjectTextarea: HTMLTextAreaElement | undefined = $state()
	let isSubmitting = $state(false)
	let submitStatus: 'idle' | 'success' | 'error' = $state('idle')
	let errorMessage = $state('')

	let attendingVisit = $state(false)
	let messageBeforeVisit: string | null = $state(null)

	const ORIGINAL_NEXT_STEPS = `Next steps
 - 30-min call. Let me know what time would work for you.
 - Alternatively, please review the letter and briefing attached and send over any questions or concerns.`

	const VISIT_SENTENCE = `**I will be visiting Parliament on Tuesday June 23rd. Will you meet with me to discuss the letter and your plan for addressing AI risks?**`

	function toggleVisit() {
		if (attendingVisit) {
			messageBeforeVisit = message
			if (message.includes(ORIGINAL_NEXT_STEPS)) {
				message = message.replace(ORIGINAL_NEXT_STEPS, VISIT_SENTENCE)
			} else {
				// User has customised the Next steps section. Insert the visit sentence
				// before the signature line so we don't trample their edits.
				const signatureMarker = '\nThank you for your consideration'
				if (message.includes(signatureMarker)) {
					message = message.replace(signatureMarker, `\n${VISIT_SENTENCE}\n${signatureMarker}`)
				} else {
					message = `${message}\n\n${VISIT_SENTENCE}`
				}
			}
		} else if (messageBeforeVisit !== null) {
			message = messageBeforeVisit
			messageBeforeVisit = null
		}
	}

	let htmlPreview = $derived(micromark(message))

	function insertMarkdown(before: string, after: string = '') {
		if (!messageTextarea) return
		const start = messageTextarea.selectionStart
		const end = messageTextarea.selectionEnd
		const selectedText = message.substring(start, end)

		const newText =
			message.substring(0, start) + before + selectedText + after + message.substring(end)
		message = newText

		// Move cursor to end of inserted text
		setTimeout(() => {
			messageTextarea?.focus()
			messageTextarea?.setSelectionRange(
				start + before.length,
				start + before.length + selectedText.length
			)
		}, 0)
	}

	function insertBulletPoint() {
		if (!messageTextarea) return
		const start = messageTextarea.selectionStart
		const end = messageTextarea.selectionEnd

		// Find the start of the current line
		const beforeCursor = message.substring(0, start)
		const lastLineBreak = beforeCursor.lastIndexOf('\n')
		const lineStart = lastLineBreak === -1 ? 0 : lastLineBreak + 1

		// Get the current line content
		const lineEnd = message.indexOf('\n', lineStart)
		const currentLineEnd = lineEnd === -1 ? message.length : lineEnd
		const currentLine = message.substring(lineStart, currentLineEnd)

		// Check if the line already has a bullet point
		if (currentLine.trimStart().startsWith('- ')) {
			// Remove the bullet point
			const trimmedLine = currentLine.trimStart()
			const bulletRemoved = trimmedLine.substring(2) // Remove "- "
			const newText =
				message.substring(0, lineStart) + bulletRemoved + message.substring(currentLineEnd)
			message = newText

			// Adjust cursor position to account for the removed "- "
			setTimeout(() => {
				messageTextarea?.focus()
				const adjustment = currentLine.length - bulletRemoved.length
				messageTextarea?.setSelectionRange(start - adjustment, end - adjustment)
			}, 0)
		} else {
			// Insert "- " at the beginning of the current line
			const newText = message.substring(0, lineStart) + '- ' + message.substring(lineStart)
			message = newText

			// Adjust cursor position to account for the inserted "- "
			setTimeout(() => {
				messageTextarea?.focus()
				messageTextarea?.setSelectionRange(start + 2, end + 2)
			}, 0)
		}
	}

	function autoResize() {
		if (messageTextarea) {
			messageTextarea.style.height = 'auto'
			messageTextarea.style.height = messageTextarea.scrollHeight + 'px'
		}
	}

	function autoResizeSubject() {
		if (subjectTextarea) {
			subjectTextarea.style.height = 'auto'
			subjectTextarea.style.height = subjectTextarea.scrollHeight + 'px'
		}
	}

	// Auto-resize when message changes
	$effect(() => {
		if (messageTextarea && message) {
			autoResize()
		}
	})

	// Auto-resize when subject changes
	$effect(() => {
		if (subjectTextarea && subject) {
			autoResizeSubject()
		}
	})

	async function handleSubmit() {
		if (!senderEmail.trim()) {
			errorMessage = 'Please fill in your email address'
			submitStatus = 'error'
			return
		}

		isSubmitting = true
		submitStatus = 'idle'

		try {
			const response = await fetch('/api/uk-send-mp-email', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					senderEmail: senderEmail.trim(),
					senderName: senderName.trim(),
					senderPostcode: userPostcode,
					recipient: mp.email,
					subject: subject.trim(),
					message: message.trim(),
					attendingVisit
				})
			})

			const result = (await response.json()) as UKSendMPEmailApiResponse

			if ('success' in result) {
				submitStatus = 'success'
			} else {
				submitStatus = 'error'
				errorMessage = result.message || 'Failed to send email'
			}
		} catch (error) {
			submitStatus = 'error'
			errorMessage = 'Network error - please try again'
			console.error('Email submission error:', error)
		} finally {
			isSubmitting = false
		}
	}
</script>

<div class="mp-email-form">
	{#if submitStatus === 'success'}
		<div class="success-message">
			<p>✅ Your email has been sent to {mp.name}!</p>
		</div>
	{:else}
		<form
			onsubmit={(e) => {
				e.preventDefault()
				onsubmit?.(e)
			}}
		>
			<div class="form-group">
				<label for="sender-email">Your email</label>
				<input
					id="sender-email"
					type="email"
					bind:value={senderEmail}
					required
					placeholder="your.email@example.com"
				/>
			</div>

			<div class="form-group">
				<label for="subject">Subject</label>
				<textarea
					id="subject"
					bind:this={subjectTextarea}
					bind:value={subject}
					required
					placeholder="Email subject"
					oninput={autoResizeSubject}
					rows="1"
					class="subject-textarea"
				></textarea>
			</div>

			<div class="form-group visit-group">
				<label class="visit-label" class:checked={attendingVisit}>
					<input
						type="checkbox"
						class="visit-tickbox"
						bind:checked={attendingVisit}
						onchange={toggleVisit}
					/>
					<span class="visit-text">
						I will attend PauseAI UK's
						<Link href="https://luma.com/q2wu0y59?utm_source=uk-email-builder" target="_blank"
							>visit to Parliament on 23<sup>rd</sup> June</Link
						> to speak with my MP in person.
					</span>
				</label>
			</div>

			<div class="form-group">
				<label for="message">Message</label>

				<div class="email-tips">
					<ul>
						<li>Customise the email to yourself and your MP</li>
						<li>MPs are very busy - keep it short!</li>
					</ul>
				</div>

				<div class="markdown-toolbar">
					<button type="button" onclick={() => insertMarkdown('**', '**')} title="Bold">
						<strong>B</strong>
					</button>
					<button type="button" onclick={() => insertMarkdown('_', '_')} title="Italic">
						<em>i</em>
					</button>
					<button type="button" onclick={() => insertMarkdown('# ', '')} title="Heading">
						H1
					</button>
					<button type="button" onclick={() => insertMarkdown('## ', '')} title="Subheading">
						H2
					</button>
					<button type="button" onclick={() => insertBulletPoint()} title="Bullet point">
						• List
					</button>
				</div>

				<div class="message-editor">
					<textarea
						id="message"
						bind:this={messageTextarea}
						bind:value={message}
						required
						placeholder="Your message to the MP"
						oninput={autoResize}
						rows="1"
					></textarea>
				</div>

				<div class="preview-section">
					<h4>Preview:</h4>
					<div class="preview-content">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- static default, user's own input -->
						{@html htmlPreview}
					</div>
				</div>

				<div class="attachments-section">
					<h4>Attachments:</h4>
					<div class="pdf-attachments">
						<Link
							href="/pdfs/AI_Liability_Open_Letter.pdf#no-localize"
							target="_blank"
							class="pdf-thumbnail"
						>
							<img
								src="/pdfs/AI_Liability_Open_Letter.jpg"
								alt="AI Liability Open Letter thumbnail"
								class="pdf-thumbnail-image"
							/>
							<div class="pdf-info">
								<span class="pdf-title">AI Liability</span>
								<span class="pdf-subtitle">Open Letter</span>
							</div>
						</Link>
						<Link
							href="/pdfs/AI_Liability_Policy_Briefing.pdf#no-localize"
							target="_blank"
							class="pdf-thumbnail"
						>
							<img
								src="/pdfs/AI_Liability_Policy_Briefing.jpg"
								alt="AI Liability Policy Briefing thumbnail"
								class="pdf-thumbnail-image"
							/>
							<div class="pdf-info">
								<span class="pdf-title">AI Liability</span>
								<span class="pdf-subtitle">Policy Briefing</span>
							</div>
						</Link>
					</div>
				</div>
			</div>

			{#if submitStatus === 'error'}
				<div class="error-message">
					{errorMessage}
				</div>
			{/if}

			<button type="button" disabled={isSubmitting} class="submit-button" onclick={handleSubmit}>
				{#if isSubmitting}
					Sending
					<LoadingSpinner size="small" color="currentColor" />
				{:else}
					Send Email
				{/if}
			</button>
		</form>
	{/if}
</div>

<style>
	.mp-email-form {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		border-radius: 8px;
		background: var(--bg-subtle);
		padding-left: 1rem;
		padding-right: 1rem;
		box-sizing: border-box;
	}

	.form-group {
		width: 100%;
		display: flex;
		flex-direction: column;
		padding-top: 1.5rem;
	}

	label {
		font-weight: 500;
		color: var(--text);
	}

	input,
	textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--border);
		border-radius: 8px;
		font-size: 1rem;
		font-weight: normal;
		background: var(--bg);
		color: var(--text);
		box-sizing: border-box;
	}

	input::placeholder,
	textarea::placeholder {
		color: var(--text-muted);
		opacity: 0.2;
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: var(--brand);
		box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.1);
	}

	textarea {
		resize: vertical;
		font-family: inherit;
	}

	.markdown-toolbar {
		display: flex;
		gap: 0.5rem;
		padding-bottom: 0.5rem;
		background: var(--bg-subtle);
		border: 1px solid var(--border);
		border-radius: 4px 4px 0 0;
		flex-wrap: wrap;
	}

	.markdown-toolbar button {
		padding: 0.25rem 0.5rem;
		border: 1px solid var(--border);
		background: var(--bg);
		color: var(--text);
		border-radius: 3px;
		cursor: pointer;
		font-size: 0.8rem;
		transition: all 0.2s;
	}

	.markdown-toolbar button:hover {
		background: var(--bg-subtle);
		border-color: var(--brand);
	}

	.markdown-toolbar button:active {
		background: var(--brand);
		color: var(--bg);
	}

	.subject-textarea {
		resize: none;
		overflow: hidden;
		white-space: pre-wrap;
		word-wrap: break-word;
	}

	.visit-group {
		padding-top: 1.5rem;
	}

	.visit-label {
		display: flex;
		align-items: flex-start;
		gap: 0.7rem;
		cursor: pointer;
		padding: 0.85rem 1rem;
		background: var(--bg);
		border: 1px solid color-mix(in srgb, var(--brand) 28%, transparent);
		border-radius: 8px;
		font-weight: 400;
		font-size: 0.95rem;
		line-height: 1.45;
		transition:
			border-color 0.15s ease,
			background-color 0.15s ease;
	}

	.visit-label:hover {
		border-color: var(--brand);
	}

	.visit-label.checked {
		border-color: var(--brand);
		background: color-mix(in srgb, var(--brand) 10%, var(--bg));
	}

	.visit-tickbox {
		appearance: none;
		width: 1.15rem;
		height: 1.15rem;
		padding: 0;
		margin: 0;
		margin-top: 0.18rem;
		flex-shrink: 0;
		border: 2px solid var(--brand);
		border-radius: 4px;
		background: var(--bg);
		cursor: pointer;
		display: grid;
		place-content: center;
	}

	.visit-tickbox::before {
		content: '';
		width: 0.65rem;
		height: 0.65rem;
		transform: scale(0);
		transition: transform 0.1s ease-in-out;
		background: var(--brand);
		clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
	}

	.visit-tickbox:checked::before {
		transform: scale(1);
	}

	.visit-tickbox:focus-visible {
		outline: 2px solid var(--brand);
		outline-offset: 2px;
	}

	.visit-text {
		flex: 1;
		min-width: 0;
	}

	.email-tips {
		background: var(--bg-subtle);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding-bottom: 0.5rem;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
	}

	.email-tips ul {
		margin: 0;
		padding-left: 1.5rem;
		color: var(--text-muted);
		list-style-type: disc;
	}

	.email-tips li {
		margin: 0.1rem 0;
	}

	.message-editor textarea {
		border: none;
		border-radius: 8px;
		resize: none;
		font-weight: lighter;
		font-size: 0.8rem;
		min-height: 200px;
		overflow: hidden;
	}

	.preview-section {
		width: 100%;
		margin-top: 1rem;
	}

	.preview-section h4 {
		margin: 0 0 0.5rem 0;
		font-size: 1rem;
		color: var(--text);
	}

	.preview-content {
		padding: 1rem;
		border: 1px solid var(--brand);
		border-radius: 6px;
		background: var(--bg);
		min-height: 400px;
		font-family: inherit;
		font-size: 0.8rem;
		line-height: 1.5;
	}

	.preview-content :global(h1) {
		font-size: 1.5rem;
		font-weight: 600;
	}

	.preview-content :global(h2) {
		font-size: 1.3rem;
		font-weight: 600;
	}

	.preview-content :global(ul) {
		padding-left: 1.5rem;
		list-style-type: disc;
		margin: 0.5rem 0;
	}

	.preview-content :global(li) {
		margin: 0.25rem 0;
		display: list-item;
	}

	.preview-content :global(strong) {
		font-weight: 600;
	}

	.preview-content :global(em) {
		font-style: italic;
	}

	.attachments-section {
		margin-top: 1.5rem;
	}

	.attachments-section h4 {
		margin: 0 0 1rem 0;
		font-size: 1rem;
		color: var(--text);
	}

	.pdf-attachments {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	* :global(.pdf-thumbnail) {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem;
		border: 2px solid var(--border);
		border-radius: 8px;
		background: var(--bg);
		text-decoration: none;
		color: var(--text);
		transition: all 0.2s ease;
		width: 200px;
	}

	.pdf-thumbnail-image {
		max-width: 150px;
	}

	* :global(.pdf-thumbnail:hover) {
		border-color: var(--brand);
		background: var(--bg-subtle);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	* :global(.pdf-thumbnail img) {
		width: 100%;
		height: auto;
		border-radius: 4px;
		margin-bottom: 0.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.pdf-info {
		text-align: center;
	}

	.pdf-title {
		display: block;
		font-weight: 600;
		font-size: 0.8rem;
		margin-bottom: 0.25rem;
		color: var(--text);
	}

	.pdf-subtitle {
		display: block;
		font-size: 0.7rem;
		color: var(--text-muted);
	}

	.submit-button {
		background: var(--brand);
		margin-top: 1rem;
		margin-bottom: 1rem;
		color: var(--bg);
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.submit-button:hover:not(:disabled) {
		background: var(--brand-dark);
	}

	.submit-button:disabled {
		background: var(--text-muted);
		cursor: not-allowed;
	}

	.success-message {
		background: var(--success-bg, #d4edda);
		color: var(--success-text, #155724);
		padding: 1rem;
		border-radius: 4px;
		border: 1px solid var(--success-border, #c3e6cb);
		margin-top: 1rem;
		margin-bottom: 1rem;
	}

	.error-message {
		background: var(--error-bg, #f8d7da);
		color: var(--error-text, #721c24);
		padding: 0.75rem;
		border-radius: 4px;
		border: 1px solid var(--error-border, #f5c6cb);
		margin-top: 1rem;
	}
</style>
