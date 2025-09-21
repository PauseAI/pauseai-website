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
	let videoElement: HTMLVideoElement | null = null
	let canvasElement: HTMLCanvasElement | null = null
	let stream: MediaStream | null = null
	const cameraAvailable = writable<boolean>(false)
	const isCapturing = writable<boolean>(false)

	// Create camera shutter sound using Web Audio API
	let audioContext: AudioContext | null = null
	let shutterSound: () => void = () => {}

	onMount(() => {
		// Load Cloudinary widget script
		const script = document.createElement('script')
		script.src = 'https://upload-widget.cloudinary.com/global/all.js'
		script.async = true
		script.onload = initializeWidget
		document.body.appendChild(script)

		// Initialize camera on mount
		initializeCamera()

		// Initialize audio for shutter sound
		initializeAudio()

		return () => {
			if (cloudinaryWidget) {
				cloudinaryWidget.destroy()
			}
			if (stream) {
				stream.getTracks().forEach((track) => track.stop())
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

	function initializeAudio() {
		try {
			// Create audio context
			const AudioContextClass =
				window.AudioContext ||
				(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
			audioContext = new AudioContextClass()

			// Create shutter sound function
			shutterSound = () => {
				if (!audioContext) return

				const now = audioContext.currentTime

				// First click - high frequency tick
				const click1 = audioContext.createOscillator()
				const gain1 = audioContext.createGain()

				click1.type = 'square'
				click1.frequency.setValueAtTime(1500, now)
				gain1.gain.setValueAtTime(0, now)
				gain1.gain.linearRampToValueAtTime(0.3, now + 0.001)
				gain1.gain.linearRampToValueAtTime(0, now + 0.003)

				click1.connect(gain1)
				gain1.connect(audioContext.destination)
				click1.start(now)
				click1.stop(now + 0.003)

				// Second click - lower frequency mechanical sound
				const click2 = audioContext.createOscillator()
				const gain2 = audioContext.createGain()

				click2.type = 'square'
				click2.frequency.setValueAtTime(800, now + 0.025)
				gain2.gain.setValueAtTime(0, now + 0.025)
				gain2.gain.linearRampToValueAtTime(0.2, now + 0.026)
				gain2.gain.linearRampToValueAtTime(0, now + 0.03)

				click2.connect(gain2)
				gain2.connect(audioContext.destination)
				click2.start(now + 0.025)
				click2.stop(now + 0.03)
			}
		} catch (error) {
			console.log('Audio context not available:', error)
			// Fallback to no sound
		}
	}

	async function initializeCamera() {
		try {
			// Check for HTTPS (required for getUserMedia except on localhost)
			if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
				console.log('Camera requires HTTPS (except localhost)')
				return
			}

			// Check if getUserMedia is available
			if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
				console.log('getUserMedia not available')
				return
			}

			// Request camera access (front camera for selfies)
			stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: 'user', // Front camera
					width: { ideal: 640 },
					height: { ideal: 480 }
				},
				audio: false
			})

			// Camera is available
			cameraAvailable.set(true)

			// Wait for next tick to ensure video element exists
			setTimeout(() => {
				if (videoElement && stream) {
					videoElement.srcObject = stream
					// Ensure video plays
					videoElement.play().catch((e) => {
						console.error('Video play failed:', e)
					})
				}
			}, 100)
		} catch (error) {
			console.log('Camera access denied or error:', error)
			cameraAvailable.set(false)
		}
	}

	async function captureFromCamera() {
		if (!videoElement || !canvasElement || $isCapturing) {
			console.log('Missing elements:', { videoElement, canvasElement, isCapturing: $isCapturing })
			return
		}

		isCapturing.set(true)

		try {
			// Check video dimensions BEFORE playing sound
			console.log('Video dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight)
			if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
				throw new Error('Video not ready - no dimensions')
			}

			const ctx = canvasElement.getContext('2d')
			if (!ctx) throw new Error('Canvas context not available')

			// Set canvas size to match video
			canvasElement.width = videoElement.videoWidth
			canvasElement.height = videoElement.videoHeight

			// Draw video frame to canvas (mirror for selfie)
			ctx.save()
			ctx.scale(-1, 1)
			ctx.drawImage(
				videoElement,
				-canvasElement.width,
				0,
				canvasElement.width,
				canvasElement.height
			)
			ctx.restore()

			// Convert to blob
			const blob = await new Promise<Blob>((resolve, reject) => {
				canvasElement!.toBlob(
					(blob) => {
						if (blob) resolve(blob)
						else reject(new Error('Failed to capture image'))
					},
					'image/jpeg',
					0.9
				)
			})

			// Play shutter sound ONLY after successful capture
			shutterSound()

			// Small delay to let sound play while uploading
			await new Promise((resolve) => setTimeout(resolve, 50))

			// Upload to Cloudinary with unique ID
			const timestamp = Date.now()
			const randomStr = Math.random().toString(36).substring(2, 8)
			const uniqueId = `selfie_${timestamp}_${randomStr}`

			const formData = new FormData()
			formData.append('file', blob, `${uniqueId}.jpg`)
			formData.append('upload_preset', 'selfie')
			formData.append('public_id', uniqueId)
			formData.append('folder', 'test_prototype')
			formData.append('tags', 'test_prototype,selfie,direct_capture')

			const response = await fetch(
				`https://api.cloudinary.com/v1_1/${import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyjlw1syg'}/image/upload`,
				{
					method: 'POST',
					body: formData
				}
			)

			if (!response.ok) throw new Error('Upload failed')

			const result = await response.json()

			// Success - update state
			currentState.set('options')
			uploadedImage.set(result.secure_url)
			uploadedImageId.set(result.public_id)

			// Don't stop camera stream - we might need it again
			// It will be cleaned up on component unmount

			toast.success('Selfie captured!')
		} catch (error) {
			console.error('Capture error:', error)
			toast.error('Failed to capture selfie. Please try the upload button below.')
		} finally {
			isCapturing.set(false)
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

			// Reinitialize camera for next capture
			await initializeCamera()

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

	// Svelte action to connect stream when video element mounts
	function connectStream(node: HTMLVideoElement) {
		if (stream && !node.srcObject) {
			node.srcObject = stream
			node.play().catch((e) => console.error('Initial play failed:', e))
		}

		return {
			destroy() {
				// Cleanup if needed
			}
		}
	}
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
			<p class="intro-text">Share your face to make this statement:</p>

			<!-- Statement as speech bubble -->
			<div class="speech-bubble">
				<blockquote class="statement-text">
					"AI development poses existential risks that require urgent safety measures. I support
					pausing frontier AI development until we can ensure it's safe."
				</blockquote>
			</div>

			<!-- Unified camera/upload widget -->
			<div class="capture-widget">
				{#if $cameraAvailable}
					<div class="camera-preview">
						<video
							bind:this={videoElement}
							on:loadedmetadata={() => {
								console.log('Video metadata loaded')
								if (stream && videoElement && !videoElement.srcObject) {
									videoElement.srcObject = stream
									videoElement.play()
								}
							}}
							use:connectStream
							autoplay
							playsinline
							muted
							class="video-feed"
						/>
						<canvas bind:this={canvasElement} style="display: none;" />
					</div>
					<button
						class="capture-button primary"
						on:click={captureFromCamera}
						disabled={$isCapturing}
					>
						{#if $isCapturing}
							Capturing...
						{:else}
							Take Selfie Now
						{/if}
					</button>
					<div class="divider">
						<span>or</span>
					</div>
				{/if}
				<button class="capture-button secondary" on:click={openUploadWidget}>
					Upload Photo from Gallery
				</button>
			</div>
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

	.intro-text {
		text-align: center;
		font-size: 1.1rem;
		margin-bottom: 1rem;
		color: var(--text-dark, #333);
	}

	.speech-bubble {
		position: relative;
		background: var(--card-bg, #ffffff);
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 2rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.speech-bubble::after {
		content: '';
		position: absolute;
		bottom: -10px;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 15px solid transparent;
		border-right: 15px solid transparent;
		border-top: 10px solid var(--card-bg, #ffffff);
		filter: drop-shadow(0 3px 3px rgba(0, 0, 0, 0.05));
	}

	.statement-text {
		font-size: 1.1rem;
		line-height: 1.6;
		margin: 0;
		font-style: italic;
		color: var(--text-dark, #333);
		text-align: center;
	}

	.capture-widget {
		background: var(--card-bg, #ffffff);
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		text-align: center;
	}

	.capture-button {
		width: 100%;
		padding: 1rem 2rem;
		font-size: 1.1rem;
		font-weight: 600;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
		margin: 0.5rem 0;
	}

	.capture-button.primary {
		background: var(--color-primary, #ff6600);
		color: white;
	}

	.capture-button.primary:hover:not(:disabled) {
		background: var(--color-primary-dark, #e55500);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(255, 102, 0, 0.3);
	}

	.capture-button.secondary {
		background: transparent;
		color: var(--color-primary, #ff6600);
		border: 2px solid var(--color-primary, #ff6600);
	}

	.capture-button.secondary:hover {
		background: var(--color-primary, #ff6600);
		color: white;
	}

	.capture-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.divider {
		position: relative;
		margin: 1.5rem 0;
		text-align: center;
	}

	.divider::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 1px;
		background: var(--border-light, #e0e0e0);
	}

	.divider span {
		position: relative;
		padding: 0 1rem;
		background: var(--card-bg, #ffffff);
		color: var(--text-light, #666);
		font-size: 0.9rem;
	}

	.camera-preview {
		margin-bottom: 1rem;
		border-radius: 8px;
		overflow: hidden;
		background: #000;
		aspect-ratio: 4/3;
		max-width: 500px;
		margin: 0 auto 1rem;
	}

	.video-feed {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transform: scaleX(-1); /* Mirror for selfie */
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
