<script lang="ts">
	import { onMount } from 'svelte'
	import Link from '$lib/components/Link.svelte'
	import ControlsSection from '$lib/components/tools/ControlsSection.svelte'
	import Studio from '$lib/components/tools/Studio.svelte'
	import ToolButton from '$lib/components/tools/ToolButton.svelte'
	import { declareCanvasFonts } from '$lib/collateral/canvasFonts'
	import { CHAPTER_CHOICES, getChapter, GLOBAL_LINK } from '$lib/collateral/chapters'
	import { canvasToPngBlob, downloadCanvasPng, downloadText } from '$lib/collateral/export'
	import { isQrLink, qrFilenameStem, qrMinPrintMm, qrTarget, qrTooLong } from '$lib/collateral/qr'
	import {
		captionFaces,
		captionFont,
		captionFontCss,
		captionLayout,
		displayLink,
		type CaptionMeasure,
		type QrCaption
	} from '$lib/collateral/qrCaption'
	import { qrShape, qrSvg } from '$lib/collateral/qrShape'
	import { INK } from '$lib/collateral/themes'
	import QrScanner from './QrScanner.svelte'

	/** Big enough for print and slides. The SVG covers anything larger. */
	const PNG_SIZE = 2048
	const PANEL = '#FFFFFF'

	let measureCtx: CanvasRenderingContext2D | null = null
	const measureCaption: CaptionMeasure = (kind, text, fontSize) => {
		// Before the page has loaded in a browser there is no canvas to measure with, so estimate.
		if (typeof document !== 'undefined')
			measureCtx ??= document.createElement('canvas').getContext('2d')
		if (!measureCtx) return text.length * fontSize * 0.55
		measureCtx.font = captionFont(kind, fontSize)
		return measureCtx.measureText(text).width
	}

	/** Loads the caption's fonts into the page, for measuring and drawing the PNG. */
	async function loadPageFonts(caption: QrCaption): Promise<void> {
		declareCanvasFonts()
		const text = `${caption.label}${caption.link}`
		await Promise.all(
			captionFaces(caption).map((f) => document.fonts.load(`${f.weight} 40px "${f.family}"`, text))
		)
	}

	/** Loads the caption's fonts into the page, and returns them inlined, for the SVG. */
	async function loadCaptionFonts(caption: QrCaption): Promise<string> {
		const [css] = await Promise.all([captionFontCss(caption), loadPageFonts(caption)])
		return css
	}

	function svgDataUrl(svg: string): string {
		return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
	}

	function loadImage(src: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const img = new Image()
			img.onload = () => resolve(img)
			img.onerror = () => reject(new Error('Could not load the image'))
			img.src = src
		})
	}

	/**
	 * How this browser can hand the PNG over besides downloading it: the share sheet on phones and tablets, the
	 * clipboard elsewhere. Desktop Chrome and Safari can share files too, but people there want to paste.
	 */
	type Handoff = 'share' | 'copy' | null

	function detectHandoff(): Handoff {
		const probe = new File([''], 'qr.png', { type: 'image/png' })
		const touch = window.matchMedia('(pointer: coarse)').matches
		if (touch && typeof navigator.canShare === 'function' && navigator.canShare({ files: [probe] }))
			return 'share'
		if (typeof ClipboardItem !== 'undefined' && typeof navigator.clipboard?.write === 'function')
			return 'copy'
		return null
	}

	/** The longest address the tool takes. Always fits in a code with the pause symbol (qr-capacity.test.ts). */
	const MAX_URL = 200

	let chapterId = $state('')
	let url = $state(displayLink(GLOBAL_LINK))
	// UTM tagging is switched off for now, see qrTarget in $lib/collateral/qr.ts.
	const track = false
	let logo = $state(true)
	let showLink = $state(false)
	let label = $state('')
	// Inlined caption fonts, and which faces they hold. Also marks the fonts as loaded, so captions are measured in
	// the right font.
	let fonts = $state<{ faces: string; css: string } | null>(null)
	let busy = $state(false)
	let message = $state<string | null>(null)
	let scanned = $state<string | null>(null)
	// A scanned web address too long to put in a code with the pause symbol.
	let scannedTooLong = $state(false)
	// A browser feature, so unknown until the page runs in one.
	let handoff = $state<Handoff>(null)

	onMount(() => {
		handoff = detectHandoff()
	})

	function onChapter() {
		url = displayLink(getChapter(chapterId).link)
		scanned = null
	}

	function onScan(text: string) {
		const trimmed = text.trim()
		// A longer address makes a code too dense for the pause symbol, or too long to make at all.
		scannedTooLong = false
		if (!isQrLink(trimmed)) {
			scanned = trimmed
		} else if (trimmed.length > MAX_URL || qrTooLong(qrTarget(trimmed, track))) {
			// A longer address makes a code too dense for the pause symbol, or too long to make at all.
			scanned = null
			scannedTooLong = true
		} else {
			url = trimmed
			scanned = null
		}
	}

	// Accented and non-Latin letters take more room in a code, so a typed address can be too long to hold.
	const tooLong = $derived(isQrLink(url) && qrTooLong(qrTarget(url, track)))
	const valid = $derived(isQrLink(url) && !tooLong)
	const target = $derived(valid ? qrTarget(url, track) : '')
	const stem = $derived(`pauseai-qr-${qrFilenameStem(url)}`)
	const caption: QrCaption = $derived({
		label: label.trim(),
		link: showLink && target ? displayLink(target) : ''
	})
	const hasCaption = $derived(caption.label !== '' || caption.link !== '')
	// The font files the caption needs: more when it uses accented, Cyrillic or Greek letters.
	const faces = $derived(
		captionFaces(caption)
			.map((f) => f.file)
			.join(' ')
	)
	const fontCss = $derived(fonts?.faces === faces ? fonts.css : undefined)

	// Fetched the first time a caption is asked for, and again when it uses letters from another subset.
	$effect(() => {
		if (!hasCaption || fontCss !== undefined) return
		const wanted = faces
		let cancelled = false
		loadCaptionFonts(caption)
			.then((css) => {
				if (!cancelled) fonts = { faces: wanted, css }
			})
			.catch(() => {
				// The preview falls back to system fonts. Downloads try again and report a failure then.
			})
		return () => {
			cancelled = true
		}
	})

	// The preview is the same SVG that gets downloaded.
	// The web address is capped at 200 characters, which always fits in a code, even with the pause symbol.
	// The code itself only changes with the address and the symbol, not as the caption is typed.
	const previewShape = $derived(target ? qrShape(target, 1000, logo) : null)
	const previewImage = $derived.by(() => {
		const shape = previewShape
		if (!shape) return null
		// Measurements change once the fonts have loaded.
		void fontCss
		const layout = captionLayout(1000, caption, measureCaption)
		const svg = qrSvg(shape, {
			background: PANEL,
			roundedPanel: false,
			caption: layout,
			fontCss
		})
		return { modules: shape.modules, src: svgDataUrl(svg), overflow: layout.overflow }
	})

	async function pngCanvas(): Promise<HTMLCanvasElement> {
		// Without the fonts (offline, say) the caption is drawn in a fallback font rather than not at all.
		if (hasCaption) await loadPageFonts(caption).catch(() => undefined)
		const layout = captionLayout(PNG_SIZE, caption, measureCaption)
		const svg = qrSvg(qrShape(target, PNG_SIZE, logo), { background: PANEL, roundedPanel: false })
		const image = await loadImage(svgDataUrl(svg))
		const canvas = document.createElement('canvas')
		canvas.width = PNG_SIZE
		canvas.height = layout.height
		const ctx = canvas.getContext('2d')
		if (!ctx) throw new Error('Canvas is not supported in this browser')
		ctx.fillStyle = PANEL
		ctx.fillRect(0, 0, canvas.width, canvas.height)
		ctx.drawImage(image, 0, 0, PNG_SIZE, PNG_SIZE)
		// Drawn on the canvas rather than in the SVG: an SVG drawn as an image cannot be relied on to have its fonts ready.
		ctx.fillStyle = INK
		ctx.textAlign = 'center'
		ctx.textBaseline = 'alphabetic'
		for (const line of layout.lines) {
			ctx.font = captionFont(line.kind, line.fontSize)
			ctx.fillText(line.text, PNG_SIZE / 2, line.baseline)
		}
		return canvas
	}

	// The buttons below are disabled until there is a preview, which needs a target.
	async function onDownloadSvg() {
		message = null
		try {
			const css = hasCaption ? await loadCaptionFonts(caption) : undefined
			const layout = captionLayout(1000, caption, measureCaption)
			const svg = qrSvg(qrShape(target, 1000, logo), {
				background: PANEL,
				roundedPanel: false,
				caption: layout,
				fontCss: css
			})
			downloadText(svg, `${stem}.svg`, 'image/svg+xml')
		} catch {
			message = 'Could not load the fonts for the text. Check your connection and try again.'
		}
	}

	async function onDownloadPng() {
		busy = true
		message = null
		try {
			await downloadCanvasPng(await pngCanvas(), `${stem}.png`)
		} catch {
			message = 'Could not create the PNG. Try the SVG instead.'
		} finally {
			busy = false
		}
	}

	/** The last PNG made for sharing, and what it shows, so a second tap can share it straight away. */
	let shareReady: { key: string; file: File } | null = null

	async function onShare() {
		busy = true
		message = null
		const key = JSON.stringify([target, logo, caption])
		try {
			let file = shareReady?.key === key ? shareReady.file : null
			if (!file) {
				const blob = await canvasToPngBlob(await pngCanvas())
				file = new File([blob], `${stem}.png`, { type: 'image/png' })
				shareReady = { key, file }
			}
			await navigator.share({ files: [file] })
		} catch (e) {
			const name = e instanceof DOMException ? e.name : ''
			// Closing the share sheet is not an error.
			if (name === 'AbortError') return
			// Making the image took long enough that the browser no longer counts the tap. It's ready now.
			if (name === 'NotAllowedError' && shareReady?.key === key)
				message = 'The image is ready. Tap Share again.'
			else message = 'Could not share the image. Download it instead.'
		} finally {
			busy = false
		}
	}

	async function onCopy() {
		busy = true
		message = null
		try {
			// Safari only allows the write if the promise for the image is handed over straight away.
			const blob = pngCanvas().then(canvasToPngBlob)
			await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
			message = 'Copied. Paste it into your document or message.'
		} catch {
			message = 'Could not copy the image. Download it instead.'
		} finally {
			busy = false
		}
	}

	const invalid = $derived(url.trim() !== '' && !valid)
</script>

<Studio pinned={false}>
	{#snippet preview()}
		<div class="frame">
			{#if previewImage}
				<img src={previewImage.src} alt={`QR code for ${target}`} />
			{:else}
				<p class="placeholder">
					{invalid
						? 'Check the web address to see the code.'
						: 'Type a web address to make a QR code.'}
				</p>
			{/if}
		</div>
		{#if previewImage}
			<p class="meta">
				Opens <Link href={target}>{target}</Link>
			</p>
		{/if}
	{/snippet}

	{#snippet controls()}
		<ControlsSection>
			<div class="tool-field">
				<label class="tool-label" for="qr-chapter">Start from</label>
				<select id="qr-chapter" class="tool-select" bind:value={chapterId} onchange={onChapter}>
					{#each CHAPTER_CHOICES as chapter (chapter.id)}
						<option value={chapter.id}>{chapter.label}</option>
					{/each}
				</select>
				<p class="tool-hint">Fills in your national group's link. You can change it below.</p>
			</div>

			<div class="tool-field">
				<label class="tool-label" for="qr-url">Web address</label>
				<input
					id="qr-url"
					class="tool-input"
					type="text"
					inputmode="url"
					autocomplete="off"
					maxlength={MAX_URL}
					placeholder="e.g. pauseai.info/join"
					bind:value={url}
					aria-invalid={invalid || undefined}
					aria-describedby={invalid ? 'qr-url-error' : undefined}
					oninput={() => {
						scanned = null
						scannedTooLong = false
					}}
				/>
				{#if tooLong}
					<p id="qr-url-error" class="tool-error">
						That address is too long for a QR code with the pause symbol. Try a shorter link.
					</p>
				{:else if invalid}
					<p id="qr-url-error" class="tool-error">
						That does not look like a web address. Try something like pauseai.info/join.
					</p>
				{/if}
				<QrScanner onResult={onScan} />
				{#if scannedTooLong}
					<p class="tool-error" role="status">
						That code holds a web address too long to fit in a code with the pause symbol. Try a
						shorter link.
					</p>
				{/if}
				{#if scanned !== null}
					<p class="tool-error" role="status">
						That code does not hold a web address{#if scanned}. It says: <q
								>{scanned.slice(0, 120)}</q
							>{:else}.{/if}
					</p>
				{/if}
			</div>

			<div class="checkboxes">
				<label class="tool-checkbox">
					<input type="checkbox" bind:checked={logo} />
					Pause symbol in the middle
				</label>
				<label class="tool-checkbox">
					<input type="checkbox" bind:checked={showLink} />
					Show the link under the code
				</label>
			</div>

			<div class="tool-field">
				<label class="tool-label" for="qr-label"
					>Label under the code <span class="tool-note">(optional)</span></label
				>
				<input
					id="qr-label"
					class="tool-input"
					type="text"
					autocomplete="off"
					maxlength="60"
					placeholder="e.g. Join PauseAI"
					bind:value={label}
				/>
			</div>
		</ControlsSection>

		<ControlsSection>
			<div class="actions">
				<ToolButton
					variant="primary"
					onclick={onDownloadPng}
					disabled={!previewImage}
					pending={busy}
				>
					Download PNG
				</ToolButton>
				<ToolButton onclick={onDownloadSvg} disabled={!previewImage}>Download SVG</ToolButton>
				{#if handoff === 'share'}
					<ToolButton onclick={onShare} disabled={!previewImage} pending={busy}>Share</ToolButton>
				{/if}
				{#if handoff === 'copy'}
					<ToolButton onclick={onCopy} disabled={!previewImage} pending={busy}
						>Copy image</ToolButton
					>
				{/if}
				{#if message}
					<p class="tool-status" role="status">{message}</p>
				{/if}
			</div>
			<p class="tool-hint">SVG is best for print. It stays sharp at any size.</p>
		</ControlsSection>

		{#if previewImage}
			<ControlsSection heading="Making sure it scans">
				<ul class="tips">
					<li>Print it at least <strong>{qrMinPrintMm(previewImage.modules)} mm</strong> wide.</li>
					{#if previewImage.modules >= 53}
						<li>This address makes a dense code. A shorter link scans more easily.</li>
					{/if}
					{#if previewImage.overflow}
						<li>The text under the code is too long to fit. Shorten the label or the link.</li>
					{/if}
					<li>Test it with a phone before you print.</li>
				</ul>
			</ControlsSection>
		{/if}
	{/snippet}
</Studio>

<style>
	.frame {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 200px;
	}

	img {
		width: 100%;
		max-width: 440px;
		height: auto;
		border: 1px solid var(--grey-150);
		border-radius: 12px;
	}

	.placeholder {
		color: var(--text-2);
	}

	.meta {
		margin: 0.75rem 0 0;
		font-size: 0.875rem;
		color: var(--text-2);
		text-align: center;
		overflow-wrap: anywhere;
	}

	.checkboxes {
		display: grid;
		gap: 0.5rem;
		margin: 1rem 0;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.625rem;
	}

	.tips {
		margin: 0;
		padding-left: 1.25rem;
		font-size: 0.875rem;
		color: var(--text-2);
	}

	.tips li + li {
		margin-top: 0.375rem;
	}

	/* A smaller code on phones, so the address field follows it on screen. */
	@media (max-width: 899px) {
		img {
			max-width: 240px;
		}
	}
</style>
