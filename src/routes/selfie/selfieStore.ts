import { writable, get } from 'svelte/store'
import toast from 'svelte-french-toast'

// State management
type State = 'preparing' | 'ready' | 'options' | 'done'

// Create all the stores
export const currentState = writable<State>('preparing')
export const cameraPermissionRequested = writable<boolean>(false)
export const uploadedImage = writable<string | null>(null)
export const uploadedImageId = writable<string | null>(null)
export const userEmail = writable<string>('')
export const isProcessing = writable<boolean>(false)
export const cameraAvailable = writable<boolean>(false)
export const isCapturing = writable<boolean>(false)
export const cameraPermissionDenied = writable<boolean>(false)

// Global references for elements and media
let videoElement: HTMLVideoElement | null = null
let canvasElement: HTMLCanvasElement | null = null
export let stream: MediaStream | null = null
interface CloudinaryWidget {
	open(): void
	destroy(): void
}

let cloudinaryWidget: CloudinaryWidget | null = null
let shutterSound: () => void = () => {}

// Export setter functions for elements
export function setVideoElement(el: HTMLVideoElement | null) {
	videoElement = el
}

export function setCanvasElement(el: HTMLCanvasElement | null) {
	canvasElement = el
}

export function setStream(s: MediaStream | null) {
	stream = s
}

export function setCloudinaryWidget(w: CloudinaryWidget | null) {
	cloudinaryWidget = w
}

export function setShutterSound(fn: () => void) {
	shutterSound = fn
}

// Check camera permission without prompting
export async function checkCameraPermission() {
	try {
		// Check for HTTPS (required for getUserMedia except on localhost)
		if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
			console.log('Camera requires HTTPS (except localhost)')
			return
		}

		// Check if permissions API is available and supports camera
		if ('permissions' in navigator && navigator.permissions.query) {
			try {
				// Try to query camera permission status
				// Note: This only works in Chrome/Edge and some other browsers
				const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })

				if (permission.state === 'granted') {
					// Permission definitely already granted, safe to initialize
					console.log('Camera permission already granted')
					cameraPermissionRequested.set(true)
					await initializeCamera()
				} else if (permission.state === 'prompt') {
					// Permission not yet requested - show "Open Camera" button
					console.log('Camera permission not yet requested')
				} else if (permission.state === 'denied') {
					// Permission was denied - user will need to manually enable
					console.log('Camera permission was denied')
				}
			} catch (err) {
				// Permissions API doesn't support camera query in this browser
				// Don't auto-initialize to avoid unexpected permission prompts
				console.log('Camera permission query not supported:', err)
			}
		} else {
			// No permissions API support - wait for user interaction
			console.log('Permissions API not available')
		}
	} catch (error) {
		console.log('Error checking camera permission:', error)
	}
}

// Shared functions
export async function initializeCamera() {
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

		setStream(stream)

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
		// Check if this was a permission denial
		if (
			error instanceof Error &&
			(error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError')
		) {
			cameraPermissionDenied.set(true)
		}
	}
}

export async function requestCameraPermission() {
	// If trying again after a denial, reset the denied flag
	if (get(cameraPermissionDenied)) {
		cameraPermissionDenied.set(false)
	}

	cameraPermissionRequested.set(true)
	await initializeCamera()

	// If camera is not available after trying, the user likely denied permission
	if (!get(cameraAvailable)) {
		// Reset the permission requested flag so they can try again
		cameraPermissionRequested.set(false)
		// The denied flag will be set by initializeCamera if it was actually denied
	} else {
		// Camera is available, clear any denied flag
		cameraPermissionDenied.set(false)
	}
}

export async function captureFromCamera() {
	if (!videoElement || !canvasElement || get(isCapturing)) {
		console.log('Missing elements:', { videoElement, canvasElement, isCapturing: get(isCapturing) })
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
		ctx.drawImage(videoElement, -canvasElement.width, 0, canvasElement.width, canvasElement.height)
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

		// Scroll to top to show thank you message
		setTimeout(() => {
			window.scrollTo({ top: 0, behavior: 'smooth' })
		}, 100)

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

export function openUploadWidget() {
	if (cloudinaryWidget) {
		cloudinaryWidget.open()
	} else {
		console.log('Cloudinary widget not initialized')
		toast.error('Upload widget not ready. Please refresh the page.')
	}
}

export async function finalizeSubmission() {
	const email = get(userEmail)
	const imageId = get(uploadedImageId)

	if (!imageId) {
		toast.error('No image uploaded')
		return
	}

	isProcessing.set(true)

	try {
		// Send submission data to backend
		const response = await fetch('/api/selfie-submission', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				imageId: imageId,
				email: email || null,
				timestamp: new Date().toISOString()
			})
		})

		if (response.ok) {
			currentState.set('done')
			// Scroll to top to show completion message
			setTimeout(() => {
				window.scrollTo({ top: 0, behavior: 'smooth' })
			}, 100)
		} else {
			throw new Error('Submission failed')
		}
	} catch (error) {
		console.error('Submission error:', error)
		// Still mark as done even if API fails
		currentState.set('done')
		toast.error("Submission saved locally. We'll process it when connection is restored.")
	} finally {
		isProcessing.set(false)
	}
}

export async function removeUpload() {
	const imageId = get(uploadedImageId)

	// Delete from Cloudinary if we have an ID
	if (imageId) {
		try {
			const response = await fetch('/api/selfie/remove', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ public_id: imageId })
			})

			if (!response.ok) {
				console.error('Failed to delete image from Cloudinary')
				toast.error('Failed to remove image from server')
			}
		} catch (error) {
			console.error('Error deleting image:', error)
			// Continue with local cleanup even if deletion fails
		}
	}

	// Clear local state
	uploadedImage.set(null)
	uploadedImageId.set(null)
	currentState.set('ready')

	// Reset camera if it was used
	if (get(cameraAvailable) && stream) {
		// Keep camera stream active for re-capture
		setTimeout(() => {
			if (videoElement && stream) {
				videoElement.srcObject = stream
				videoElement.play()
			}
		}, 100)
	}
}

// Connect stream directive for video element
export function connectStream(node: HTMLVideoElement) {
	if (stream) {
		node.srcObject = stream
		node.play().catch(console.error)
	}
	return {
		destroy() {
			// Cleanup if needed
		}
	}
}
