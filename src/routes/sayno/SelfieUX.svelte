<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import {
		currentState,
		cameraPermissionRequested,
		uploadedImage,
		userEmail,
		isProcessing,
		cameraAvailable,
		isCapturing,
		cameraPermissionDenied,
		requestCameraPermission,
		captureFromCamera,
		openUploadWidget,
		finalizeSubmission,
		removeUpload,
		connectStream,
		setVideoElement,
		setCanvasElement,
		stream
	} from './selfieStore'

	// Local element references
	let videoElement: HTMLVideoElement | null = null
	let canvasElement: HTMLCanvasElement | null = null

	// Update store when elements are bound
	$: setVideoElement(videoElement)
	$: setCanvasElement(canvasElement)

	$: emailValid = $userEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($userEmail)

	// Local UI state
	let showTips = false
</script>

<!-- Compact capture UX above standard page header -->
<section class="capture-ux">
	{#if $currentState === 'preparing'}
		<div class="loading-state">
			<p>Loading...</p>
		</div>
	{:else if $currentState === 'ready'}
		<!-- Campaign heading -->
		<div class="book-title">
			<div>Say No To Superintelligent AI</div>
		</div>

		<!-- Statement speech bubble -->
		<p class="statement-intro">Upload your selfie to say:</p>
		<div class="speech-bubble compact">
			<div class="statement-text">"I demand we end the race to build superintelligent AI"</div>
		</div>

		<!-- Camera/upload widget -->
		<div class="capture-area">
			{#if !$cameraAvailable}
				<!-- Show placeholder until camera is actually available -->
				<div class="camera-box placeholder">
					<svg class="silhouette" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
						<rect width="300" height="400" fill="var(--bg-subtle)" />
						<circle cx="150" cy="150" r="50" fill="var(--border)" />
						<ellipse cx="150" cy="270" rx="75" ry="60" fill="var(--border)" />
					</svg>
				</div>
				<button
					class="capture-button primary"
					on:click={requestCameraPermission}
					disabled={($cameraPermissionRequested && !$cameraAvailable) || $cameraPermissionDenied}
				>
					{#if $cameraPermissionRequested && !$cameraAvailable && !$cameraPermissionDenied}
						Requesting Camera...
					{:else if $cameraPermissionDenied}
						Camera Blocked - Reload!
					{:else}
						Open Camera
					{/if}
				</button>
			{:else}
				<!-- Camera is available, show live feed -->
				<div class="camera-box">
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
				<button class="capture-button primary" on:click={captureFromCamera} disabled={$isCapturing}>
					{#if $isCapturing}
						Capturing...
					{:else}
						Take Selfie
					{/if}
				</button>
			{/if}
			<button class="capture-button secondary" on:click={openUploadWidget}>
				Use Existing Photo
			</button>
		</div>
	{:else if $currentState === 'options'}
		<div class="confirmation-section">
			<h2>Thank you!</h2>
			<p class="upload-success">Photo uploaded successfully for use in collage.</p>

			<div class="next-steps">
				<div class="email-section">
					<div class="email-row">
						<label for="email-input">Please add:</label>
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
						>We won't share this, but it helps us show real people supported, <strong
							>and we'll tell you once you're in a collage!</strong
						></small
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

				<!-- Selfie tips - expandable -->
				<div class="tips-section">
					<button
						class="tips-toggle"
						on:click={() => (showTips = !showTips)}
						aria-expanded={showTips}
					>
						{showTips ? '▼' : '▶'} Tips for a better selfie
					</button>
					{#if showTips}
						<div class="tips-content">
							<ul>
								<li>📸 Use your best camera</li>
								<li>💡 Find good lighting - natural light works best</li>
								<li>🎯 Center your face in the frame</li>
								<li>📐 Hold camera at eye level or slightly above</li>
								<li>🤳 Keep camera at arm's length</li>
								<li>🏞️ Choose a simple background</li>
							</ul>
							<p class="tips-footer">Not happy? Remove your photo above and try again!</p>
						</div>
					{/if}
				</div>
			{/if}

			<p class="next-info">
				<strong>What happens next:</strong> We'll review your photo and add it to our growing collage
				of AI safety supporters.
			</p>
		</div>
	{:else if $currentState === 'done'}
		<div class="success-section">
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
		</div>
	{/if}
</section>

<style>
	/* Copy all the styles from the original +page.svelte that apply to .capture-ux and its children */
	.capture-ux {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 1rem;
		margin: 1rem 0 2rem 0;
		text-align: center;
	}

	.book-title {
		font-size: 1.8rem;
		font-weight: bold;
		line-height: 1.2;
		margin-bottom: 1rem;
		color: var(--text);
		text-align: center;
	}

	.statement-intro {
		font-size: 0.9rem;
		color: var(--text);
		opacity: 0.8;
		margin: 1rem 0 0.5rem 0;
		text-align: center;
	}

	.speech-bubble {
		background: var(--brand);
		color: white;
		padding: 0.75rem 1rem;
		border-radius: 12px;
		position: relative;
		margin: 1rem 0 1.5rem 0;
		display: inline-block;
	}

	.speech-bubble::after {
		content: '';
		position: absolute;
		bottom: -8px;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 10px solid transparent;
		border-right: 10px solid transparent;
		border-top: 10px solid var(--brand);
	}

	.statement-text {
		font-size: 1.1rem;
		font-weight: 500;
		line-height: 1.3;
	}

	.camera-box {
		width: 100%;
		max-width: 200px;
		margin: 0 auto 1rem auto;
		border: 2px solid var(--border);
		border-radius: 8px;
		overflow: hidden;
		aspect-ratio: 3/4;
		background: var(--bg-subtle);
		position: relative;
	}

	.camera-box.placeholder {
		background: var(--bg-subtle);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.silhouette {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.video-feed {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transform: scaleX(-1);
	}

	.capture-button {
		display: block;
		width: 100%;
		max-width: 400px;
		margin: 0.5rem auto;
		padding: 0.75rem;
		font-size: 1.1rem;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}

	.capture-button.primary {
		background: var(--brand);
		color: white;
		font-weight: 600;
	}

	.capture-button.primary:hover:not(:disabled) {
		background: var(--brand-dark);
		transform: translateY(-1px);
	}

	.capture-button.secondary {
		background: transparent;
		color: var(--brand);
		border: 1px solid var(--brand);
	}

	.capture-button.secondary:hover {
		background: var(--brand);
		color: white;
	}

	.capture-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.confirmation-section,
	.success-section {
		padding: 1rem;
	}

	.upload-success {
		color: var(--success);
		font-weight: 600;
		margin: 0.5rem 0;
	}

	.email-section {
		background: var(--bg-subtle);
		border-radius: 8px;
		padding: 1rem;
		margin: 1rem 0;
	}

	.email-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 1rem 0;
		flex-wrap: wrap;
	}

	.email-row label {
		font-weight: 600;
	}

	.email-row input {
		flex: 1;
		min-width: 200px;
		padding: 0.5rem;
		border: 1px solid var(--border);
		border-radius: 4px;
		font-size: 1rem;
	}

	.button-center {
		display: flex;
		justify-content: center;
		margin: 1rem 0;
	}

	.action-buttons {
		margin: 1rem 0;
		display: flex;
		justify-content: center;
		gap: 1rem;
	}

	.preview-container {
		margin: 1rem 0;
	}

	.preview {
		max-width: 200px;
		border-radius: 8px;
		border: 2px solid var(--border);
	}

	.tips-section {
		margin: 1rem 0;
		text-align: left;
	}

	.tips-toggle {
		background: none;
		border: none;
		color: var(--brand);
		cursor: pointer;
		padding: 0.5rem 0;
		font-size: 0.95rem;
		font-weight: 500;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0 auto;
		transition: opacity 0.2s;
	}

	.tips-toggle:hover {
		opacity: 0.8;
	}

	.tips-content {
		background: var(--bg-subtle);
		border-radius: 8px;
		padding: 1rem;
		margin-top: 0.5rem;
		animation: slideDown 0.2s ease-out;
	}

	.tips-content ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.tips-content li {
		padding: 0.4rem 0;
		font-size: 0.9rem;
		color: var(--text);
	}

	.tips-footer {
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--border);
		font-size: 0.85rem;
		text-align: center;
		color: var(--text-subtle);
		font-style: italic;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.next-info {
		background: var(--bg-subtle);
		padding: 0.75rem;
		border-radius: 4px;
		margin: 1rem 0;
		font-size: 0.9rem;
	}

	.loading-state {
		padding: 2rem;
		color: var(--text-subtle);
	}

	/* Mobile adjustments */
	@media (max-width: 768px) {
		.capture-ux {
			margin: 0.5rem 0 1rem 0;
			padding: 1rem 0.5rem;
		}

		.book-title {
			font-size: 1.3rem;
			padding: 0 0.5rem;
		}

		.statement-text {
			font-size: 1rem;
		}

		.email-row {
			flex-direction: column;
			align-items: flex-start;
		}

		.email-row label {
			align-self: flex-start;
		}

		.email-row input {
			width: 100%;
		}
	}
</style>
