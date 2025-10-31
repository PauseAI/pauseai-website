<script lang="ts">
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import Link from '$lib/components/Link.svelte'
	import Banner from '$lib/components/Banner.svelte'
	import { Toaster } from 'svelte-french-toast'
	import toast from 'svelte-french-toast'
	import {
		currentState,
		uploadedImage,
		uploadedImageId,
		setCloudinaryWidget,
		setShutterSound,
		stream,
		checkCameraPermission,
		cloudinaryConfig,
		returningUidMessage
	} from './selfieStore'
	import Image from '$lib/components/Image.svelte'
	import { detectAndStoreCollagenUid, hasCollagenUid } from '$lib/collagen'

	// Page metadata
	const title = 'Stop Superintelligence'
	const description =
		'Add your selfie to say: "I demand we end the race to build superintelligent AI"'
	const collageImage = 'https://s3.amazonaws.com/pauseai-collagen/sayno/latest/1024.jpg'

	// Track user state for contextual messaging
	let userJustValidated = false // UID in URL params (just clicked validate link)
	let userPreviouslyUploaded = false // UID in localStorage (uploaded before on this device)

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

	// Create camera shutter sound using Web Audio API
	let audioContext: AudioContext | null = null

	onMount(() => {
		// Check if UID in URL params (just validated email)
		userJustValidated = detectAndStoreCollagenUid('sayno', $page.url.searchParams)

		// Check if UID exists from previous upload (but not in URL)
		if (!userJustValidated) {
			userPreviouslyUploaded = hasCollagenUid('sayno')
			if (userPreviouslyUploaded) {
				returningUidMessage.set('This device submitted already. But go ahead if new!')
			}
		}

		// Skip upload UI initialization only if user just validated
		if (userJustValidated) {
			currentState.set('validated') // Special state to hide SelfieUX
			return
		}

		// Load Cloudinary widget script
		const script = document.createElement('script')
		script.src = 'https://upload-widget.cloudinary.com/global/all.js'
		script.async = true
		script.onload = initializeWidget
		document.body.appendChild(script)

		// Check if camera permission was already granted (without prompting)
		checkCameraPermission()

		// Initialize audio for shutter sound
		initializeAudio()

		return () => {
			if (cloudinaryWidget) {
				cloudinaryWidget.destroy()
			}
			if (stream) {
				stream.getTracks().forEach((track) => track.stop())
			}
			if (script.parentNode) {
				document.body.removeChild(script)
			}
		}
	})

	function initializeWidget() {
		const cloudinary = (window as CloudinaryWindow).cloudinary
		if (typeof window !== 'undefined' && cloudinary) {
			cloudinaryWidget = cloudinary.createUploadWidget(
				{
					cloudName: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyjlw1syg',
					uploadPreset: 'selfie',
					sources: ['camera', 'local', 'google_drive', 'dropbox'],
					multiple: false,
					folder: cloudinaryConfig.folder,
					tags: cloudinaryConfig.tags,
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

						// Scroll to top to show thank you message
						setTimeout(() => {
							window.scrollTo({ top: 0, behavior: 'smooth' })
						}, 100)
					} else if (result.event === 'close') {
						// Widget was closed - no action needed, stay in ready state
						console.log('Upload widget closed')
					}
				}
			)
			setCloudinaryWidget(cloudinaryWidget)
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
			const shutterSound = () => {
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
			// Set the shutter sound function in the store
			setShutterSound(shutterSound)
		} catch (error) {
			console.log('Audio context not available:', error)
			// Fallback to no sound
		}
	}
</script>

<PostMeta {title} {description} image={collageImage} />

<!-- Capture UX is now rendered via the layout's prelude slot, configured in +page.ts -->

<!-- Standard page content -->
<main class="selfie-page">
	{#if userPreviouslyUploaded && !userJustValidated}
		<Banner id="sayno-already-uploaded">
			This device already submitted a photo, but by all means use it for new people.
		</Banner>
	{/if}

	<article class="page-content">
		<h2 class="book-title-heading">If Anyone Builds It, Everyone Dies</h2>
		<p>
			This book presents a stark warning about the existential risks posed by the race to build
			artificial general intelligence. The campaign draws its urgency from this critical message.
		</p>
		<p>
			<Link href="/if-anyone-builds-it-campaign">Learn more about the campaign →</Link>
		</p>

		<div id="info" class="collage-info">
			<h3>The Growing Collage</h3>
			<p>
				We're building a visual petition of people who believe AI development needs urgent safety
				measures. Your selfie adds to the growing collage of concerned citizens worldwide.
			</p>
			<Link href="https://s3.amazonaws.com/pauseai-collagen/sayno/latest/4096.jpg" target="_blank">
				<Image
					src="https://s3.amazonaws.com/pauseai-collagen/sayno/latest/400.jpg"
					alt="Collage of hundreds of people standing up to superintelligent AI development"
					class="collage-thumbnail"
				/>
			</Link>
			<Link href="/if-anyone-builds-it-campaign#say-no-to-superintelligent-ai" class="link">
				<p class="collage-caption">View the full collage and campaign details →</p>
			</Link>
			<p>
				By uploading, you consent to your photo being featured as part of this petition and
				promotional materials.
			</p>
		</div>
	</article>
</main>

<!-- Toast notifications -->
<Toaster
	toastOptions={{
		style: 'background-color: var(--bg-subtle); color: var(--text)',
		iconTheme: {
			primary: 'var(--brand)',
			secondary: 'white'
		}
	}}
/>

<style>
	/* Standard page content styles */
	.selfie-page {
		max-width: 800px;
		margin: 2rem auto;
		padding: 1rem;
	}

	.page-content {
		padding: 1rem;
	}

	.page-content p {
		margin-bottom: 1rem;
		line-height: 1.6;
	}

	.book-title-heading {
		font-size: 1.8rem;
		font-weight: bold;
		text-align: center;
		margin: 2rem 0 1.5rem 0;
		color: var(--text);
	}

	.collage-info {
		margin: 2rem 0;
		padding: 1.5rem;
		background: var(--bg-subtle);
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.collage-info h3 {
		margin: 0 0 1rem 0;
		color: var(--text);
	}

	.collage-info :global(.link) {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.collage-info :global(.collage-thumbnail) {
		max-width: 100%;
		height: auto;
		border-radius: 4px;
		border: 2px solid var(--border);
		margin-bottom: 0.5rem;
	}

	.collage-caption {
		margin: 0.5rem 0 0 0;
		color: var(--text);
		background-color: var(--brand);
		padding: 0.5rem 1rem;
		border-radius: 4px;
		font-weight: 500;
	}

	@media (max-width: 768px) {
		.book-title-heading {
			font-size: 1.5rem;
		}

		.collage-info {
			padding: 1rem;
		}
	}
</style>
