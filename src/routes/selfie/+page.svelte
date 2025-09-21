<script lang="ts">
	import { onMount } from 'svelte'
	import { writable } from 'svelte/store'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import Button from '$lib/components/Button.svelte'
	import toast from 'svelte-french-toast'

	// Page metadata
	const title = 'Facing AI Danger'
	const description =
		'Upload your selfie to support the "If Anyone Builds It, Everyone Dies" book campaign'

	// State management
	type State = 'preparing' | 'ready' | 'options' | 'done'
	const currentState = writable<State>('preparing')
	const uploadedImage = writable<string | null>(null)
	const uploadedImageId = writable<string | null>(null)
	const userEmail = writable<string>('')
	const isProcessing = writable<boolean>(false)

	interface CloudinaryWidget {
		destroy(): void
		open(): void
	}

	interface CloudinaryWindow extends Window {
		cloudinary?: {
			createUploadWidget: (
				options: Record<string, unknown>,
				callback: (error: Error | null, result: CloudinaryResult) => void
			) => CloudinaryWidget
		}
	}

	interface CloudinaryResult {
		event: string
		info?: {
			secure_url: string
			public_id: string
		}
	}

	let cloudinaryWidget: CloudinaryWidget | null = null

	onMount(() => {
		// Load Cloudinary widget script
		const script = document.createElement('script')
		script.src = 'https://upload-widget.cloudinary.com/global/all.js'
		script.async = true
		script.onload = initializeWidget
		document.body.appendChild(script)

		return () => {
			if (cloudinaryWidget) {
				cloudinaryWidget.destroy()
			}
			document.body.removeChild(script)
		}
	})

	function initializeWidget() {
		const cloudinary = (window as CloudinaryWindow).cloudinary
		if (typeof window !== 'undefined' && cloudinary) {
			cloudinaryWidget = cloudinary.createUploadWidget(
				{
					cloudName: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyjlw1syg',
					uploadPreset: 'selfie',
					sources: ['camera', 'local', 'facebook', 'instagram', 'google_drive', 'dropbox'],
					multiple: false,
					folder: 'test_prototype',
					tags: ['test_prototype', 'selfie'],
					context: {
						uploaded_at: new Date().toISOString()
					},
					resourceType: 'image',
					// Note: clientAllowedFormats breaks camera access on Android 14+
					// We use resourceType: 'image' for server-side validation instead
					maxFileSize: 10000000, // 10MB
					cropping: false,
					showPoweredBy: false,
					singleUploadAutoClose: true,
					styles: {
						palette: {
							window: '#FFFFFF',
							windowBorder: '#E0E0E0',
							tabIcon: '#ff9416', // PauseAI orange
							menuIcons: '#5A616A',
							textDark: '#000000',
							textLight: '#FFFFFF',
							link: '#ff9416', // PauseAI orange
							action: '#ff9416', // PauseAI orange
							inactiveTabIcon: '#90A0B3',
							error: '#F44235',
							inProgress: '#ff9416', // PauseAI orange
							complete: '#20B832',
							sourceBg: '#FFF4E6' // Light orange tint
						},
						fonts: {
							default: "'Roboto Slab', serif",
							primary: "'Roboto Slab', serif",
							secondary: "'Saira Condensed', Impact, sans-serif"
						}
					}
				},
				async (error: Error | null, result: CloudinaryResult) => {
					if (error) {
						console.error('Upload error:', error)
						toast.error('Upload failed. Please try again.')
						return
					}

					if (result.event === 'success' && result.info) {
						console.log('Upload result:', result.info)
						currentState.set('options')
						uploadedImage.set(result.info.secure_url)
						uploadedImageId.set(result.info.public_id)
					} else if (result.event === 'close') {
						// Widget was closed - no action needed, stay in ready state
						console.log('Upload widget closed')
					}
				}
			)
			currentState.set('ready')
		}
	}

	function openUploadWidget() {
		if (cloudinaryWidget) {
			// Destroy and recreate to ensure fresh state
			cloudinaryWidget.destroy()
			initializeWidget()
			setTimeout(() => {
				if (cloudinaryWidget) {
					cloudinaryWidget.open()
				}
			}, 100)
		} else {
			toast.error('Upload widget not ready. Please refresh the page.')
		}
	}

	async function removeUpload() {
		if (!$uploadedImageId || $isProcessing) return

		isProcessing.set(true)
		try {
			const response = await fetch('/api/selfie/remove', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ public_id: $uploadedImageId })
			})

			if (!response.ok) throw new Error('Failed to remove')

			// Reset to ready state
			currentState.set('ready')
			uploadedImage.set(null)
			uploadedImageId.set(null)
			userEmail.set('')
			toast.success('Photo removed')
		} catch (error) {
			console.error('Error removing upload:', error)
			toast.error('Failed to remove image. Please try again.')
		} finally {
			isProcessing.set(false)
		}
	}

	async function finalizeSubmission() {
		if ($isProcessing) return

		isProcessing.set(true)
		// Add email to metadata if provided
		if ($userEmail && $uploadedImageId) {
			try {
				const response = await fetch('/api/selfie/add-email', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						public_id: $uploadedImageId,
						email: $userEmail
					})
				})

				if (!response.ok) {
					toast.error(
						'Failed to save email address. Please try again or continue without notification.'
					)
					isProcessing.set(false)
					return // Don't proceed to done state
				}
			} catch (error) {
				console.error('Error adding email:', error)
				toast.error(
					'Failed to save email address. Please try again or continue without notification.'
				)
				isProcessing.set(false)
				return // Don't proceed to done state
			}
		}

		currentState.set('done')
		toast.success('Thank you for joining!')
		isProcessing.set(false)
	}

	$: emailValid = $userEmail.includes('@') && $userEmail.includes('.')
</script>

<PostMeta {title} {description} />

<article class="selfie-upload">
	{#if $currentState !== 'options' && $currentState !== 'done'}
		<header>
			<h1>{title}</h1>
			<p class="tagline">Join us in saying: "Read this book. Understand the risks."</p>
		</header>
	{/if}

	{#if $currentState === 'preparing'}
		<section class="upload-section">
			<div class="upload-container">
				<div class="button-center">
					<Button disabled={true}>Preparing...</Button>
				</div>
			</div>
		</section>
	{:else if $currentState === 'ready'}
		<section class="upload-section">
			<button class="statement-upload-card" on:click={openUploadWidget}>
				<div class="statement-content">
					<blockquote>
						"AI development poses existential risks that require urgent safety measures. I support
						pausing frontier AI development until we can ensure it's safe."
					</blockquote>
				</div>
				<div class="upload-action">
					<span class="upload-button-text">📷 Upload My Photo</span>
				</div>
			</button>
		</section>
	{:else if $currentState === 'options'}
		<section class="confirmation-section">
			<h2>Thank you!</h2>
			<p class="upload-success">Photo uploaded successfully.</p>

			<div class="next-steps">
				<div class="email-section">
					<div class="email-row">
						<label for="email-input">Please add</label>
						<input
							id="email-input"
							type="email"
							bind:value={$userEmail}
							placeholder="your@email.com"
							on:keypress={(e) => {
								if (e.key === 'Enter' && emailValid) {
									finalizeSubmission()
								}
							}}
						/>
					</div>
					<small
						>We won't share this, but it helps us show real people supported. We'll also tell you
						when you're in the collage!</small
					>

					{#if $userEmail && emailValid}
						<div class="button-center">
							<Button on:click={finalizeSubmission} disabled={$isProcessing}>
								{#if $isProcessing}
									Processing...
								{:else}
									✓ Submit & Get Notified
								{/if}
							</Button>
						</div>
					{/if}
				</div>

				<div class="action-buttons">
					<Button on:click={removeUpload} subtle={true} disabled={$isProcessing}>
						{#if $isProcessing}
							Processing...
						{:else}
							❌ Remove Photo & Start Over
						{/if}
					</Button>
				</div>
			</div>

			{#if $uploadedImage}
				<div class="preview-container">
					<img src={$uploadedImage} alt="Your uploaded selfie" class="preview" />
				</div>
			{/if}

			<p class="next-info">
				<strong>What happens next:</strong> We'll review your photo and add it to our growing collage
				of AI safety supporters.
			</p>
		</section>
	{:else if $currentState === 'done'}
		<section class="success-section">
			<h2>🎉 Thank you!</h2>

			{#if $userEmail}
				<p>
					We'll email you at <strong>{$userEmail}</strong> when your photo appears in the collage.
				</p>
			{:else}
				<p>Your photo will be added to the collage after review.</p>
			{/if}

			<p>
				Thank you for standing with us for AI safety. Together, we're building a growing petition of
				people who care about this critical issue.
			</p>
		</section>
	{/if}

	<section class="campaign-info">
		<h3>About the Campaign</h3>
		<p>
			From September 16 to October 13, 2025, we're building a visual representation of global
			concern about AI risks. The book launches on September 16, with reading events worldwide from
			October 4-13.
		</p>
		<p>
			<a href="https://ifanyonebuildsit.com" target="_blank" rel="noopener">
				Learn more about the book →
			</a>
		</p>
	</section>
</article>

<style>
	.selfie-upload {
		max-width: 600px;
		margin: 2rem auto;
		padding: 1rem;
	}

	header {
		text-align: center;
		margin-bottom: 2rem;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}

	.tagline {
		font-size: 1.1rem;
		color: var(--text-light);
		font-style: italic;
	}

	.statement-upload-card {
		background: var(--bg-light);
		border: 2px solid var(--color-primary, #ff9416);
		border-radius: 12px;
		padding: 1.5rem;
		margin: 1.5rem 0;
		cursor: pointer;
		transition: all 0.2s ease;
		width: 100%;
		text-align: left;
		font-family: inherit;
		font-size: inherit;
		color: inherit;
	}

	.statement-upload-card:hover {
		background: var(--bg-lighter);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(255, 148, 22, 0.2);
	}

	.statement-upload-card:active {
		transform: translateY(0);
	}

	.statement-content {
		margin-bottom: 1rem;
	}

	.upload-action {
		text-align: center;
		padding-top: 1rem;
		border-top: 1px solid var(--border-light);
	}

	.upload-button-text {
		display: inline-block;
		background: var(--color-primary, #ff9416);
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: bold;
		font-size: 1.1rem;
	}

	blockquote {
		font-size: 1.1rem;
		line-height: 1.6;
		margin: 0;
		padding-left: 1rem;
		border-left: 3px solid var(--color-primary);
	}

	.upload-container {
		text-align: center;
		margin: 2rem 0;
	}

	.privacy-note {
		margin-top: 1rem;
		color: var(--text-light);
		font-size: 0.95rem;
	}

	.confirmation-section h2 {
		text-align: center;
		color: var(--color-success, #20b832);
		margin-bottom: 0.1rem;
		font-size: 1.5rem;
	}

	.upload-success {
		text-align: center;
		margin-bottom: 0.5rem;
		font-size: 0.95rem;
		color: var(--text-light);
	}

	.preview-container {
		text-align: center;
		margin: 0.75rem 0;
	}

	.preview {
		max-width: 300px;
		max-height: 400px;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.action-buttons {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--border-light);
		flex-wrap: wrap;
	}

	.next-steps {
		background: var(--bg-lighter);
		padding: 0.75rem;
		border-radius: 8px;
		margin-top: 0.5rem;
	}

	.email-section {
		margin: 0.5rem 0;
	}

	.email-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.email-row label {
		white-space: nowrap;
		font-weight: 500;
	}

	.email-row input {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid var(--border);
		border-radius: 4px;
		font-size: 1rem;
		min-width: 0;
	}

	.email-section small {
		display: block;
		margin-top: 0.5rem;
		margin-bottom: 1rem;
		color: var(--text-light);
		font-size: 0.85rem;
		line-height: 1.4;
	}

	.button-center {
		display: flex;
		justify-content: center;
		margin: 0.5rem 0;
	}

	.next-info {
		margin-top: 0.75rem;
		padding: 0.5rem;
		background: var(--bg-lighter);
		border-radius: 8px;
		font-size: 0.9rem;
		color: var(--text-light);
		text-align: center;
	}

	.success-section {
		text-align: center;
		padding: 2rem;
		background: var(--bg-light);
		border-radius: 8px;
	}

	.success-section h2 {
		margin-bottom: 1.5rem;
	}

	.success-section p {
		margin: 1rem 0;
		line-height: 1.6;
	}

	.campaign-info {
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid var(--border);
	}

	.campaign-info h3 {
		margin-bottom: 1rem;
	}

	/* Mobile optimizations */
	@media (max-width: 600px) {
		.selfie-upload {
			padding: 0.5rem;
		}

		h1 {
			font-size: 1.5rem;
		}

		.tagline {
			font-size: 1rem;
		}

		.action-buttons {
			flex-direction: column;
		}
	}
</style>
