<script lang="ts">
	import { onMount } from 'svelte'
	import { writable } from 'svelte/store'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import Button from '$lib/components/Button.svelte'
	import toast from 'svelte-french-toast'

	// Page metadata
	const title = 'Add Your Face for AI Safety'
	const description =
		'Upload your selfie to support the "If Anyone Builds It, Everyone Dies" book campaign'

	// State management
	type UploadState = 'initial' | 'uploading' | 'confirming' | 'done'
	const currentState = writable<UploadState>('initial')
	const uploadedImage = writable<string | null>(null)
	const uploadedImageId = writable<string | null>(null)
	const userEmail = writable<string>('')
	const isBlurred = writable<boolean>(false)
	const isProcessing = writable<boolean>(false)
	const widgetReady = writable<boolean>(false)

	let cloudinaryWidget: any = null

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
		if (typeof window !== 'undefined' && (window as any).cloudinary) {
			cloudinaryWidget = (window as any).cloudinary.createUploadWidget(
				{
					cloudName: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyjlw1syg',
					uploadPreset: 'selfie',
					sources: ['camera', 'local', 'facebook', 'instagram', 'google_drive', 'dropbox'],
					multiple: false,
					folder: 'test_prototype/pending',
					tags: ['pending', 'test_prototype', 'selfie'],
					context: {
						uploaded_at: new Date().toISOString()
					},
					resourceType: 'image',
					clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
					maxFileSize: 10000000, // 10MB
					cropping: false,
					showPoweredBy: false,
					singleUploadAutoClose: true,
					styles: {
						palette: {
							window: '#FFFFFF',
							windowBorder: '#90A0B3',
							tabIcon: '#FF4444',
							menuIcons: '#5A616A',
							textDark: '#000000',
							textLight: '#FFFFFF',
							link: '#FF4444',
							action: '#FF4444',
							inactiveTabIcon: '#0E2F5A',
							error: '#F44235',
							inProgress: '#0078FF',
							complete: '#20B832',
							sourceBg: '#E4EBF1'
						}
					}
				},
				async (error: any, result: any) => {
					if (error) {
						console.error('Upload error:', error)
						toast.error('Upload failed. Please try again.')
						return
					}

					if (result.event === 'success') {
						console.log('Upload result:', result.info)
						currentState.set('confirming')
						uploadedImage.set(result.info.secure_url)
						uploadedImageId.set(result.info.public_id)
					}
				}
			)
			widgetReady.set(true)
		}
	}

	function openUploadWidget() {
		if (cloudinaryWidget) {
			// Destroy and recreate to ensure fresh state
			cloudinaryWidget.destroy()
			initializeWidget()
			setTimeout(() => {
				if (cloudinaryWidget) {
					currentState.set('uploading')
					cloudinaryWidget.open()
				}
			}, 100)
		} else {
			toast.error('Upload widget not ready. Please refresh the page.')
		}
	}

	async function applyBlur() {
		if (!$uploadedImageId || $isProcessing) return

		isProcessing.set(true)
		try {
			const response = await fetch('/api/selfie/blur', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ public_id: $uploadedImageId })
			})

			if (!response.ok) throw new Error('Failed to blur')

			const result = await response.json()

			// Update the display with blurred version and new ID
			isBlurred.set(true)
			uploadedImage.set(result.url)
			if (result.public_id) {
				uploadedImageId.set(result.public_id) // Update to new blurred ID
			}
			toast.success('Face blurred successfully')
		} catch (error) {
			console.error('Error applying blur:', error)
			toast.error('Failed to blur image. Please try again.')
		} finally {
			isProcessing.set(false)
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

			// Reset to initial state
			currentState.set('initial')
			uploadedImage.set(null)
			uploadedImageId.set(null)
			userEmail.set('')
			isBlurred.set(false)
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

	function startOver() {
		currentState.set('initial')
		uploadedImage.set(null)
		uploadedImageId.set(null)
		userEmail.set('')
		isBlurred.set(false)
	}

	$: emailValid = $userEmail.includes('@') && $userEmail.includes('.')
</script>

<PostMeta {title} {description} />

<article class="selfie-upload">
	<header>
		<h1>{title}</h1>
		<p class="tagline">Join others saying: "Read this book. Understand the risks."</p>
	</header>

	{#if $currentState === 'initial'}
		<section class="upload-section">
			<div class="statement-box">
				<h2>By uploading a photo, you express support for:</h2>
				<blockquote>
					"AI development poses existential risks that require urgent safety measures. I support
					pausing frontier AI development until we can ensure it's safe."
				</blockquote>
			</div>

			<div class="upload-container">
				<div class="button-center">
					<Button
						on:click={openUploadWidget}
						variant="primary"
						size="large"
						disabled={!$widgetReady}
					>
						{#if !$widgetReady}
							Loading...
						{:else}
							📷 Upload Your Photo
						{/if}
					</Button>
				</div>
				<p class="privacy-note">✓ You'll be able to blur your face if you want privacy</p>
			</div>
		</section>
	{:else if $currentState === 'confirming'}
		<section class="confirmation-section">
			<h2>Thank you for your support!</h2>
			<p class="upload-success">Your photo has been uploaded successfully.</p>

			<div class="next-steps">
				<div class="email-section">
					<label>
						<strong>Add your email (helps verify this is a real petition):</strong>
						<input
							type="email"
							bind:value={$userEmail}
							placeholder="your@email.com"
							on:keypress={(e) => {
								if (e.key === 'Enter' && emailValid) {
									finalizeSubmission()
								}
							}}
						/>
						<small
							>We'll notify you when your photo appears in the collage. Your email helps prove these
							are real supporters, not bots. We won't share it or spam you.</small
						>
					</label>

					{#if $userEmail && emailValid}
						<div class="button-center">
							<Button
								on:click={finalizeSubmission}
								variant="primary"
								size="large"
								disabled={$isProcessing}
							>
								{#if $isProcessing}
									Processing...
								{:else}
									✓ Submit & Get Notified
								{/if}
							</Button>
						</div>
					{/if}

					<div class="skip-email">
						<button class="text-button" on:click={finalizeSubmission} disabled={$isProcessing}>
							{#if $isProcessing}
								Processing...
							{:else}
								Continue without email notification
							{/if}
						</button>
					</div>
				</div>

				<div class="action-buttons">
					{#if !$isBlurred}
						<Button on:click={applyBlur} variant="secondary" disabled={$isProcessing}>
							{#if $isProcessing}
								Processing...
							{:else}
								🔒 Blur My Face for Privacy
							{/if}
						</Button>
					{/if}
					<Button on:click={removeUpload} variant="secondary" disabled={$isProcessing}>
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
					<img src={$uploadedImage} alt="Your uploaded photo" class="preview" />
					{#if $isBlurred}
						<p class="blur-status">✓ Face blurred for privacy</p>
					{/if}
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

	.statement-box {
		background: var(--bg-light);
		padding: 1.5rem;
		border-radius: 8px;
		margin-bottom: 2rem;
	}

	.statement-box h2 {
		font-size: 1.1rem;
		margin-bottom: 1rem;
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
		margin-bottom: 0.5rem;
	}

	.upload-success {
		text-align: center;
		margin-bottom: 1.5rem;
		font-size: 1.1rem;
	}

	.preview-container {
		text-align: center;
		margin: 1.5rem 0;
	}

	.preview {
		max-width: 300px;
		max-height: 400px;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.blur-status {
		margin-top: 0.5rem;
		color: var(--color-success);
		font-weight: 500;
	}

	.action-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border-light);
		flex-wrap: wrap;
	}

	.next-steps {
		background: var(--bg-lighter);
		padding: 1.5rem;
		border-radius: 8px;
		margin-top: 2rem;
	}

	.email-section {
		margin: 1.5rem 0;
	}

	.email-section label {
		display: block;
	}

	.email-section input {
		width: 100%;
		padding: 0.5rem;
		margin-top: 0.5rem;
		border: 1px solid var(--border);
		border-radius: 4px;
		font-size: 1rem;
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
		margin: 1rem 0;
	}

	.skip-email {
		text-align: center;
		margin: 1.5rem 0;
	}

	.text-button {
		background: none;
		border: none;
		color: var(--text-light);
		text-decoration: underline;
		cursor: pointer;
		font-size: 0.95rem;
		padding: 0.5rem;
	}

	.text-button:hover {
		color: var(--text-dark);
	}

	.next-info {
		margin-top: 1.5rem;
		padding: 1rem;
		background: var(--bg-lighter);
		border-radius: 8px;
		font-size: 0.95rem;
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
