<script lang="ts" module>
	/** Frames are shrunk to this width before decoding. Plenty for a code that fills part of the view, and quick on phones. */
	const SCAN_WIDTH = 640
	/** Photos can be large, so they are shrunk too, but less, as the code may be small in the shot. */
	const PHOTO_MAX = 1600
	/** Zoomed-in parts of a photo, and areas people draw round, are shrunk to at most this size. */
	const REGION_MAX = 1000
	/** A second, smaller pass. The decoder often reads a blurry or dotted code better when it is smaller. */
	const REGION_SMALL = 400
	/** Scaling small areas up helps the decoder a little, but much past 2x it starts to fail. */
	const MAX_UPSCALE = 2
	/** How long to search a photo by itself before asking the person to draw a box round the code. */
	const PHOTO_BUDGET_MS = 4000
	const SCAN_EVERY_MS = 150
	/** Boxes smaller than this share of the photo are treated as a stray tap. */
	const MIN_BOX = 0.03

	type JsQr = typeof import('jsqr').default

	/** A part of an image, as fractions of its width and height. */
	interface Region {
		x: number
		y: number
		w: number
		h: number
	}

	const WHOLE: Region = { x: 0, y: 0, w: 1, h: 1 }

	let jsQrPromise: Promise<JsQr> | null = null
	/** Loaded on first use so the decoder stays out of the page bundle for people who never scan. */
	function loadJsQr(): Promise<JsQr> {
		jsQrPromise ??= import('jsqr').then((m) => m.default)
		return jsQrPromise
	}

	interface DecodeOptions {
		/** Longest side, in pixels, the region is drawn at before decoding. Never more than MAX_UPSCALE times its real size. */
		size: number
		/** Also try the inverted image, for light codes on dark backgrounds. Doubles the work. */
		thorough: boolean
	}

	function decode(
		jsQr: JsQr,
		source: HTMLVideoElement | HTMLImageElement | ImageBitmap,
		sourceWidth: number,
		sourceHeight: number,
		region: Region,
		canvas: HTMLCanvasElement,
		{ size, thorough }: DecodeOptions
	): string | null {
		const sx = region.x * sourceWidth
		const sy = region.y * sourceHeight
		const sw = region.w * sourceWidth
		const sh = region.h * sourceHeight
		const scale = Math.min(size / Math.max(sw, sh), MAX_UPSCALE)
		const width = Math.max(1, Math.round(sw * scale))
		const height = Math.max(1, Math.round(sh * scale))
		canvas.width = width
		canvas.height = height
		const ctx = canvas.getContext('2d', { willReadFrequently: true })
		if (!ctx) return null
		ctx.drawImage(source, sx, sy, sw, sh, 0, 0, width, height)
		const { data } = ctx.getImageData(0, 0, width, height)
		return (
			jsQr(data, width, height, { inversionAttempts: thorough ? 'attemptBoth' : 'dontInvert' })
				?.data ?? null
		)
	}

	/** Overlapping tiles across the image, so a code that is small in the shot fills more of what the decoder sees. `perSide` is at least 2. */
	function tiles(perSide: number, tileSize: number): Region[] {
		const step = (1 - tileSize) / (perSide - 1)
		const out: Region[] = []
		for (let row = 0; row < perSide; row++) {
			for (let col = 0; col < perSide; col++)
				out.push({ x: col * step, y: row * step, w: tileSize, h: tileSize })
		}
		return out
	}

	/** Grows a region on every side, kept inside the image. People tend to draw tight round a code and clip its edge. */
	function pad(region: Region, amount: number): Region {
		const px = region.w * amount
		const py = region.h * amount
		const x = Math.max(0, region.x - px)
		const y = Math.max(0, region.y - py)
		return {
			x,
			y,
			w: Math.min(1, region.x + region.w + px) - x,
			h: Math.min(1, region.y + region.h + py) - y
		}
	}

	/**
	 * Lets the browser paint between decodes, so the page does not freeze.
	 * Not requestAnimationFrame, which stops firing if the person switches tab while it runs.
	 */
	const yieldToBrowser = () => new Promise((resolve) => setTimeout(resolve, 0))

	/**
	 * The whole photo, then smaller and smaller zoomed-in parts of it. Gives up after PHOTO_BUDGET_MS, as a busy photo can
	 * take the decoder a second or more per attempt on a phone.
	 */
	async function findInPhoto(jsQr: JsQr, bitmap: ImageBitmap): Promise<string | null> {
		const canvas = document.createElement('canvas')
		const deadline = Date.now() + PHOTO_BUDGET_MS
		// Small first: the decoder misreads round-dot codes, like our own, when each dot is many pixels wide. The big pass is
		// for codes that are small in the shot, and skips the inverted image as it is the slowest.
		const attempts: [Region, DecodeOptions][] = [
			[WHOLE, { size: 800, thorough: true }],
			[WHOLE, { size: REGION_SMALL, thorough: true }],
			[WHOLE, { size: PHOTO_MAX, thorough: false }],
			...tiles(2, 0.6).map((r): [Region, DecodeOptions] => [
				r,
				{ size: REGION_MAX, thorough: true }
			]),
			...tiles(3, 0.45).map((r): [Region, DecodeOptions] => [
				r,
				{ size: REGION_MAX, thorough: true }
			])
		]
		for (const [region, options] of attempts) {
			const text = decode(jsQr, bitmap, bitmap.width, bitmap.height, region, canvas, options)
			if (text) return text
			if (Date.now() > deadline) return null
			await yieldToBrowser()
		}
		return null
	}

	function findInRegion(jsQr: JsQr, image: HTMLImageElement, region: Region): string | null {
		const canvas = document.createElement('canvas')
		for (const r of [pad(region, 0.1), region]) {
			for (const size of [REGION_MAX, REGION_SMALL]) {
				const text = decode(jsQr, image, image.naturalWidth, image.naturalHeight, r, canvas, {
					size,
					thorough: true
				})
				if (text) return text
			}
		}
		return null
	}
</script>

<script lang="ts">
	import ToolButton from '$lib/components/tools/ToolButton.svelte'

	interface Props {
		/** Called with whatever text the code holds. */
		onResult: (text: string) => void
	}

	let { onResult }: Props = $props()

	// Reads an existing QR code from the camera, or from a photo when there is no camera or it is blocked.

	// Camera running.
	let open = $state(false)
	// Below the buttons, for photos that could not be opened at all.
	let message = $state<string | null>(null)
	// Inside the modal: camera problems, and boxes with no code in them.
	let modalMessage = $state<string | null>(null)
	let busy = $state(false)
	// A photo the code could not be found in automatically, shown so the person can draw a box round the code.
	// Its object URL. The box is read from the <img> showing it.
	let photo = $state<string | null>(null)
	let box = $state<Region | null>(null)
	let dialog: HTMLDialogElement
	let video = $state<HTMLVideoElement>()
	let fileInput: HTMLInputElement
	let image = $state<HTMLImageElement>()
	let dragStart: { x: number; y: number } | null = null

	const modalOpen = $derived(open || photo !== null)

	// showModal gives the focus trap, Escape to close and the backdrop, so the dialog is opened through it, not the open attribute.
	$effect(() => {
		if (modalOpen && !dialog.open) dialog.showModal()
		if (!modalOpen && dialog.open) dialog.close()
	})

	$effect(() => {
		if (!open) return
		let stream: MediaStream | null = null
		let frame = 0
		let stopped = false
		const canvas = document.createElement('canvas')

		async function start() {
			if (!navigator.mediaDevices?.getUserMedia) {
				modalMessage =
					'This browser cannot use the camera here. Choose a photo of the code instead.'
				return
			}
			try {
				const [jsQr, media] = await Promise.all([
					loadJsQr(),
					navigator.mediaDevices.getUserMedia({
						video: { facingMode: 'environment' },
						audio: false
					})
				])
				stream = media
				// Closed while the permission prompt or camera was starting: let the camera go straight away.
				if (stopped || !video) {
					media.getTracks().forEach((t) => t.stop())
					return
				}
				const v = video
				v.srcObject = media
				await v.play()
				if (stopped) return

				let last = 0
				// Closing cancels the next frame, so a tick never runs after it.
				const tick = (now: number) => {
					if (now - last >= SCAN_EVERY_MS && v.videoWidth) {
						last = now
						// Printed codes are dark on light, so the camera skips the inverted pass to keep up with the frames.
						const text = decode(jsQr, v, v.videoWidth, v.videoHeight, WHOLE, canvas, {
							size: Math.min(SCAN_WIDTH, v.videoWidth),
							thorough: false
						})
						if (text) {
							open = false
							onResult(text)
							return
						}
					}
					frame = requestAnimationFrame(tick)
				}
				frame = requestAnimationFrame(tick)
			} catch (e) {
				if (stopped) return
				const denied =
					e instanceof DOMException && (e.name === 'NotAllowedError' || e.name === 'SecurityError')
				modalMessage = denied
					? 'Camera access was blocked. Allow it in your browser settings, or choose a photo of the code instead.'
					: 'Could not start the camera. Choose a photo of the code instead.'
			}
		}

		void start()
		return () => {
			stopped = true
			cancelAnimationFrame(frame)
			stream?.getTracks().forEach((t) => t.stop())
		}
	})

	function closePhoto() {
		if (photo) URL.revokeObjectURL(photo)
		photo = null
		box = null
	}

	/** Runs however the modal closes: a button, Escape, or a code being found. */
	function onModalClose() {
		open = false
		closePhoto()
		modalMessage = null
	}

	function found(text: string) {
		closePhoto()
		open = false
		message = null
		onResult(text)
	}

	async function onPhoto(e: Event & { currentTarget: HTMLInputElement }) {
		// No file when the person cancels the picker.
		const file = e.currentTarget.files?.[0]
		e.currentTarget.value = ''
		if (!file) return
		closePhoto()
		open = false
		message = null
		busy = true
		try {
			const [jsQr, bitmap] = await Promise.all([loadJsQr(), createImageBitmap(file)])
			let text: string | null
			try {
				text = await findInPhoto(jsQr, bitmap)
			} finally {
				// A big photo's pixels are a lot of memory on a phone, so let them go even when decoding fails.
				bitmap.close()
			}
			if (text) {
				found(text)
				return
			}
			photo = URL.createObjectURL(file)
		} catch {
			message = 'Could not read that image. Try a different photo.'
		} finally {
			busy = false
		}
	}

	/** Where the pointer is over the photo, as fractions of its size. */
	function pointAt(e: PointerEvent, img: HTMLImageElement): { x: number; y: number } {
		const rect = img.getBoundingClientRect()
		const clamp = (n: number) => Math.min(1, Math.max(0, n))
		return {
			x: clamp((e.clientX - rect.left) / rect.width),
			y: clamp((e.clientY - rect.top) / rect.height)
		}
	}

	function onPointerDown(e: PointerEvent & { currentTarget: HTMLDivElement }) {
		if (!image) return
		const p = pointAt(e, image)
		e.currentTarget.setPointerCapture(e.pointerId)
		dragStart = p
		box = { x: p.x, y: p.y, w: 0, h: 0 }
	}

	function onPointerMove(e: PointerEvent) {
		const start = dragStart
		if (!start || !image) return
		const p = pointAt(e, image)
		box = {
			x: Math.min(start.x, p.x),
			y: Math.min(start.y, p.y),
			w: Math.abs(p.x - start.x),
			h: Math.abs(p.y - start.y)
		}
	}

	async function onPointerUp() {
		dragStart = null
		// No box when the press started outside the photo.
		if (!box || !image) return
		if (box.w < MIN_BOX || box.h < MIN_BOX) {
			box = null
			return
		}
		const jsQr = await loadJsQr()
		const text = findInRegion(jsQr, image, box)
		if (text) found(text)
		else modalMessage = 'No code in that box. Try drawing it again, a little bigger than the code.'
	}
</script>

<div class="scan">
	<div class="actions">
		<!-- Not while a photo is being searched, so its result can't arrive in the middle of a camera scan. -->
		<ToolButton
			size="small"
			disabled={busy}
			onclick={() => {
				message = null
				open = true
			}}
		>
			Scan an existing code
		</ToolButton>
		<ToolButton size="small" onclick={() => fileInput.click()} pending={busy}
			>Use a photo</ToolButton
		>
		<input bind:this={fileInput} type="file" accept="image/*" hidden onchange={onPhoto} />
	</div>
	{#if message}
		<p class="tool-error" role="status">{message}</p>
	{/if}

	<dialog bind:this={dialog} aria-labelledby="qr-scan-title" onclose={onModalClose}>
		<h2 id="qr-scan-title">{photo ? 'Find the QR code' : 'Scan a QR code'}</h2>
		<p class="tool-hint">
			{photo
				? 'Could not find the code by itself. Drag a box round the QR code in the photo.'
				: 'Point your camera at the code. It reads it by itself.'}
		</p>
		<!-- Hidden once the camera fails, rather than leaving an empty black box. -->
		{#if open && !modalMessage}
			<video bind:this={video} muted playsinline aria-label="Camera view. Point it at a QR code."
			></video>
		{/if}
		{#if photo}
			<div
				class="crop"
				role="presentation"
				onpointerdown={onPointerDown}
				onpointermove={onPointerMove}
				onpointerup={onPointerUp}
				onpointercancel={() => {
					dragStart = null
					box = null
				}}
			>
				<img
					bind:this={image}
					src={photo}
					alt="What you chose. Drag a box round the QR code."
					draggable="false"
				/>
				{#if box}
					<div
						class="box"
						style:left="{box.x * 100}%"
						style:top="{box.y * 100}%"
						style:width="{box.w * 100}%"
						style:height="{box.h * 100}%"
					></div>
				{/if}
			</div>
		{/if}
		{#if modalMessage}
			<p class="tool-error" role="status">{modalMessage}</p>
		{/if}
		<div class="actions dialog-actions">
			{#if open && modalMessage}
				<ToolButton size="small" onclick={() => fileInput.click()} pending={busy}>
					Use a photo instead
				</ToolButton>
			{/if}
			<ToolButton size="small" onclick={() => dialog.close()}>Cancel</ToolButton>
		</div>
	</dialog>
</div>

<style>
	.scan {
		margin-top: 0.625rem;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	/* Camera and photo cropping, in a modal over the page. */
	dialog {
		width: min(480px, calc(100vw - 32px));
		max-height: calc(100dvh - 32px);
		padding: 1.25rem;
		border: none;
		border-radius: 12px;
		background-color: var(--bg);
		color: var(--text);
	}

	dialog::backdrop {
		background-color: rgba(var(--black-rgb), 0.6);
	}

	h2 {
		margin: 0;
		font-size: 1.4rem;
	}

	.dialog-actions {
		justify-content: flex-end;
		margin-top: 1rem;
	}

	video {
		display: block;
		width: 100%;
		aspect-ratio: 1;
		object-fit: cover;
		margin-top: 0.875rem;
		border-radius: 8px;
		background-color: var(--black);
	}

	/* Photo the code was not found in: drag a box round the code. */
	.crop {
		position: relative;
		display: inline-block;
		margin-top: 0.875rem;
		overflow: hidden;
		border-radius: 8px;
		cursor: crosshair;
		touch-action: none;
		user-select: none;
	}

	.crop img {
		display: block;
		max-width: 100%;
		max-height: 60dvh;
		pointer-events: none;
	}

	.box {
		position: absolute;
		border: 2px solid var(--brand);
		box-shadow: 0 0 0 9999px rgba(var(--black-rgb), 0.45);
		pointer-events: none;
	}
</style>
