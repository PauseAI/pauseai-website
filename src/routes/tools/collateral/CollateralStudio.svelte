<script lang="ts">
	import { onMount } from 'svelte'
	import ControlsSection from '$lib/components/tools/ControlsSection.svelte'
	import Studio from '$lib/components/tools/Studio.svelte'
	import ToolButton from '$lib/components/tools/ToolButton.svelte'
	import { subsetsFor } from '$lib/collateral/canvasFonts'
	import {
		downloadCanvasPdf,
		downloadCanvasPng,
		downloadText,
		exportFilename
	} from '$lib/collateral/export'
	import {
		BLEED_MM,
		DEFAULT_FORMAT_ID,
		FORMAT_GROUPS,
		FORMATS,
		formatDimensionLabel,
		getFormat,
		previewStyle,
		renderSize,
		type PrintFormat
	} from '$lib/collateral/formats'
	import { sameIssues, type LintIssue } from '$lib/collateral/lint'
	import { panPhoto, zoomPhoto, type PhotoView } from '$lib/collateral/photoTransform'
	import { parseProject, serializeProject, type Project } from '$lib/collateral/project'
	import { qrPlan, usableQrCodes } from '$lib/collateral/qr'
	import {
		loadFonts,
		loadImage,
		renderCollateral,
		type RenderOptions
	} from '$lib/collateral/render'
	import { LOGO_COVER_TITLE_CHARS, type Drawable } from '$lib/collateral/templates'
	import { CLEAR_PHOTO_LOGO_SRC, getTheme, THEMES } from '$lib/collateral/themes'
	import Checks from './Checks.svelte'
	import CropControls from './CropControls.svelte'
	import DesignControls from './DesignControls.svelte'
	import ProjectMenu from './ProjectMenu.svelte'
	import TitleSizeControl from './TitleSizeControl.svelte'
	import {
		designCountry,
		designDefaults,
		designFromData,
		designQrCodes,
		designTemplate,
		designToData,
		designValues,
		newDesign,
		withQrCodes,
		type DesignState
	} from './designState'

	const RESET_MESSAGE = 'Reset to the example text.'
	const STORAGE_KEY = 'pauseai-collateral-v1'
	const PREVIEW_MAX_SIDE = 1400
	const MAX_PROJECT_FILE_BYTES = 12_000_000
	const DEFAULT_VIEW: PhotoView = { zoom: 1, focalX: 0.5, focalY: 0.5 }
	/** Checks that mean the title size nudge may help. */
	const TITLE_ISSUES = ['text-overflow', 'title-small']

	let formatId = $state(DEFAULT_FORMAT_ID)
	let design = $state.raw<DesignState>(newDesign())
	// A crop belongs to the photo it was set on, so a new photo starts centred and unzoomed.
	let photoViewState = $state.raw<{ photo: Drawable | null; view: PhotoView }>({
		photo: null,
		view: DEFAULT_VIEW
	})
	let headlineScale = $state(1)
	// QR codes on a screen format (social posts), where they are left out unless asked for.
	let screenQr = $state(false)
	let issues = $state.raw<LintIssue[]>([])
	let restored = $state(false)
	// Which download is being made, if one is.
	let busy = $state<'png' | 'pdf' | null>(null)
	let message = $state<string | null>(null)
	// Restores what the last Reset cleared. Only offered while the reset message is showing.
	let undoReset = $state.raw<(() => void) | null>(null)
	let canvas = $state<HTMLCanvasElement>()

	// Canvas fonts and every style's logo variant, loaded once, so switching styles is instant.
	let logos = $state.raw<Record<string, Drawable>>({})
	let assetError = $state<string | null>(null)
	/** The font subsets loaded so far, as a key. A design in another script loads more, then redraws. */
	let fontsLoaded = $state<string | null>(null)

	const format = $derived(getFormat(formatId))
	const template = $derived(designTemplate(design))
	const theme = $derived(getTheme(design.themeId))
	const values = $derived(designValues(design))
	const logo = $derived(logos[theme.logoSrc] ?? null)
	const fontsReady = $derived(fontsLoaded !== null)
	const ready = $derived(!busy && Boolean(logo) && fontsReady)

	/** Every piece of text the design draws, to know which font subsets it needs. */
	const designText = $derived(
		[
			...Object.values(values),
			designCountry(design),
			...designQrCodes(design).map((c) => c.label)
		].join(' ')
	)
	const fontKey = $derived(subsetsFor(designText).join(','))

	onMount(() => {
		let cancelled = false
		for (const src of new Set(THEMES.map((t) => t.logoSrc))) {
			loadImage(src)
				.then((img) => {
					if (!cancelled) logos = { ...logos, [src]: img }
				})
				.catch(() => {
					if (!cancelled) assetError = 'Could not load the logo.'
				})
		}
		return () => {
			cancelled = true
		}
	})

	$effect(() => {
		const needed = fontKey.split(',')
		const text = designText
		if (fontsLoaded !== null && needed.every((s) => fontsLoaded!.split(',').includes(s))) return
		let cancelled = false
		void loadFonts(text)
			.catch(() => undefined)
			.then(() => {
				if (cancelled) return
				const loaded = new Set([...(fontsLoaded?.split(',') ?? []), ...needed])
				fontsLoaded = [...loaded].join(',')
			})
		return () => {
			cancelled = true
		}
	})

	// Why QR codes are hidden or trimmed on this format, shown beside the codes.
	const qrReason = $derived.by(() => {
		const exportSize = renderSize(format)
		return qrPlan({
			width: exportSize.width,
			height: exportSize.height,
			dpi: exportSize.dpi,
			urls: usableQrCodes(designQrCodes(design)).map((c) => c.url),
			track: design.trackQr,
			sizePref: design.qrSize
		}).reason
	})

	const currentPhoto = $derived(design.photo?.drawable ?? null)
	const photoView = $derived(
		photoViewState.photo === currentPhoto ? photoViewState.view : DEFAULT_VIEW
	)
	function setPhotoView(fn: (v: PhotoView) => PhotoView) {
		const photo = currentPhoto
		const current = photoViewState.photo === photo ? photoViewState.view : DEFAULT_VIEW
		photoViewState = { photo, view: fn(current) }
	}

	function update(fn: (d: DesignState) => DesignState) {
		design = fn(design)
	}

	function currentProject(embedUploads: boolean): Project {
		return {
			...designToData(design, embedUploads),
			formatId,
			photoSettings: photoView,
			headlineScale,
			screenQr
		}
	}

	// Puts a saved or restored project on screen. Returns false if an image could not be loaded.
	async function applyProject(project: Project): Promise<boolean> {
		const { design: loaded, ok } = await designFromData(project)
		design = loaded
		formatId = project.formatId
		headlineScale = project.headlineScale
		screenQr = project.screenQr
		const { zoom, focalX, focalY } = project.photoSettings
		photoViewState = { photo: loaded.photo?.drawable ?? null, view: { zoom, focalX, focalY } }
		return ok
	}

	// Restore the last session once, in the browser.
	onMount(() => {
		void (async () => {
			try {
				const raw = localStorage.getItem(STORAGE_KEY)
				const result = raw ? parseProject(raw) : null
				if (result?.ok) await applyProject(result.project)
			} catch {
				// Storage can be blocked (private windows etc). The tool works without it.
			}
			restored = true
		})()
	})

	// Autosave. Uploaded photos are not kept (too big for browser storage), library photos and partner logos are.
	$effect(() => {
		if (!restored) return
		const project = serializeProject(currentProject(false))
		try {
			localStorage.setItem(STORAGE_KEY, project)
		} catch {
			// Ignore, see above.
		}
	})

	function renderOptions(bleed: boolean): RenderOptions {
		return {
			format,
			template,
			theme,
			values,
			country: designCountry(design),
			logo: logo!,
			photo: design.photo?.drawable ?? null,
			photoSettings: photoView,
			qrCodes: designQrCodes(design),
			trackQr: design.trackQr,
			qrSize: design.qrSize,
			photoClear: design.photoClear,
			coverTitle: design.coverTitle,
			clearPhotoLogo: logos[CLEAR_PHOTO_LOGO_SRC],
			screenQr,
			headlineScale,
			partnerLogos: design.partnerLogos.map((l) => l.drawable),
			bleed
		}
	}

	// Live preview and its checks, redrawn whenever anything it draws changes, and again once more fonts load.
	$effect(() => {
		if (!logo || !fontsLoaded || !canvas) return
		const { issues: found } = renderCollateral(canvas, {
			...renderOptions(false),
			maxSide: PREVIEW_MAX_SIDE,
			lint: true
		})
		if (!sameIssues(issues, found)) issues = found
	})

	// Drag to move the photo, pinch or scroll to zoom it.
	const pointers = new Map<number, { x: number; y: number }>()
	let pinch: { dist: number; zoom: number } | null = null

	$effect(() => {
		const c = canvas
		const photo = currentPhoto
		if (!c || !photo) return
		const img = { w: photo.width, h: photo.height }
		const onWheel = (e: WheelEvent) => {
			e.preventDefault()
			const rect = c.getBoundingClientRect()
			const k = c.width / rect.width
			const anchor = { x: (e.clientX - rect.left) * k, y: (e.clientY - rect.top) * k }
			const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
			const factor = Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.0015))
			setPhotoView((v) => zoomPhoto(img, { w: c.width, h: c.height }, v, v.zoom * factor, anchor))
		}
		// Needs a non-passive listener to stop the page scrolling.
		c.addEventListener('wheel', onWheel, { passive: false })
		return () => c.removeEventListener('wheel', onWheel)
	})

	function onPointerDown(e: PointerEvent & { currentTarget: HTMLCanvasElement }) {
		if (!currentPhoto) return
		e.currentTarget.setPointerCapture(e.pointerId)
		pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
		if (pointers.size === 2) {
			const [a, b] = [...pointers.values()]
			pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, zoom: photoView.zoom }
		}
	}

	function onPointerMove(e: PointerEvent & { currentTarget: HTMLCanvasElement }) {
		const c = e.currentTarget
		const prev = pointers.get(e.pointerId)
		const photo = currentPhoto
		if (!photo || !prev) return
		const next = { x: e.clientX, y: e.clientY }
		pointers.set(e.pointerId, next)
		const img = { w: photo.width, h: photo.height }
		const box = { w: c.width, h: c.height }
		const rect = c.getBoundingClientRect()
		const k = c.width / rect.width
		if (pointers.size === 1) {
			setPhotoView((v) => panPhoto(img, box, v, (next.x - prev.x) * k, (next.y - prev.y) * k))
		} else if (pointers.size === 2 && pinch) {
			const [a, b] = [...pointers.values()]
			const mid = { x: ((a.x + b.x) / 2 - rect.left) * k, y: ((a.y + b.y) / 2 - rect.top) * k }
			const zoom = (pinch.zoom * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.dist
			setPhotoView((v) => zoomPhoto(img, box, v, zoom, mid))
		}
	}

	function onPointerEnd(e: PointerEvent) {
		pointers.delete(e.pointerId)
		pinch = null
	}

	// The download buttons are disabled until the logo and fonts have loaded.
	async function onDownloadPng() {
		busy = 'png'
		message = null
		try {
			const c = document.createElement('canvas')
			renderCollateral(c, renderOptions(false))
			await downloadCanvasPng(c, exportFilename([template.id, format.id, theme.id], 'png'))
		} catch {
			message = 'Could not create the image. Try a smaller format.'
		} finally {
			busy = null
		}
	}

	async function onDownloadPdf(print: PrintFormat) {
		busy = 'pdf'
		message = null
		try {
			const c = document.createElement('canvas')
			renderCollateral(c, renderOptions(true))
			await downloadCanvasPdf(
				c,
				print,
				BLEED_MM,
				exportFilename([template.id, print.id, theme.id], 'pdf')
			)
		} catch {
			message = 'Could not create the PDF. Try again, or download the PNG instead.'
		} finally {
			busy = null
		}
	}

	function onSaveProject() {
		message = null
		try {
			downloadText(
				serializeProject(currentProject(true)),
				exportFilename([template.id, format.id, 'project'], 'json'),
				'application/json'
			)
			message = 'Project file saved. Open it from the ⋯ menu to carry on editing.'
		} catch {
			message = 'Could not save the project.'
		}
	}

	async function onOpenProject(file: File | undefined) {
		if (!file) return
		message = null
		if (file.size > MAX_PROJECT_FILE_BYTES) {
			message = 'That file is too big to be a saved project.'
			return
		}
		const result = parseProject(await file.text())
		if (!result.ok) {
			message = result.error
			return
		}
		const ok = await applyProject(result.project)
		message = ok
			? `Opened ${file.name}.`
			: `Opened ${file.name}, but an image in it could not be loaded.`
	}

	function onReset() {
		const before = { design, photoViewState, headlineScale }
		const t = template
		design = {
			...withQrCodes(design, []),
			valuesByTemplate: { ...design.valuesByTemplate, [t.id]: designDefaults(design, t) },
			photo: null,
			partnerLogos: []
		}
		headlineScale = 1
		message = RESET_MESSAGE
		undoReset = () => {
			design = before.design
			headlineScale = before.headlineScale
			photoViewState = before.photoViewState
			undoReset = null
			message = null
		}
	}

	const titleFlagged = $derived(issues.some((i) => TITLE_ISSUES.includes(i.id)))
	const shown = $derived(message ?? assetError)
	const canvasWidth = $derived(previewStyle(format)?.width)
</script>

<Studio>
	{#snippet preview()}
		<div class="frame">
			<canvas
				bind:this={canvas}
				aria-label={`Preview of ${format.label}`}
				hidden={!(logo && fontsReady)}
				class:draggable={Boolean(design.photo)}
				style:width={canvasWidth ? `${canvasWidth}px` : undefined}
				onpointerdown={onPointerDown}
				onpointermove={onPointerMove}
				onpointerup={onPointerEnd}
				onpointercancel={onPointerEnd}
			></canvas>
			{#if !(logo && fontsReady)}
				<p class="loading">Loading…</p>
			{/if}
		</div>
		<p class="meta">
			{format.label} · {formatDimensionLabel(format)}{#if design.photo}
				· Drag the photo to move it. Scroll or pinch to zoom.{/if}
		</p>
		<div class="actions">
			<Checks {issues} />
			<ToolButton
				variant="primary"
				onclick={onDownloadPng}
				disabled={!ready}
				pending={busy === 'png'}
			>
				Download PNG
			</ToolButton>
			{#if format.kind === 'print'}
				{@const print = format}
				<ToolButton
					variant="primary"
					onclick={() => onDownloadPdf(print)}
					disabled={!ready}
					pending={busy === 'pdf'}
				>
					Download print PDF (+{BLEED_MM} mm bleed)
				</ToolButton>
			{/if}
			<ProjectMenu
				noun="project"
				onSave={onSaveProject}
				onOpen={onOpenProject}
				{onReset}
				saveDisabled={!restored}
			/>
			{#if shown}
				<p class="tool-status" role="status">
					{shown}
					{#if message === RESET_MESSAGE && undoReset}
						<button type="button" class="tool-link" onclick={undoReset}>Undo</button>
					{/if}
				</p>
			{/if}
		</div>
	{/snippet}

	{#snippet controls()}
		<ControlsSection heading="1. Format">
			<label class="tool-label" for="collateral-format">Where will it be used?</label>
			<select id="collateral-format" class="tool-select" bind:value={formatId}>
				{#each FORMAT_GROUPS as group (group)}
					<optgroup label={group}>
						{#each FORMATS.filter((f) => f.group === group) as f (f.id)}
							<option value={f.id}>{f.label} ({formatDimensionLabel(f)})</option>
						{/each}
					</optgroup>
				{/each}
			</select>
			{#if format.note}
				<p class="tool-hint">{format.note}</p>
			{/if}
			{#if format.kind === 'digital' && format.logoCover}
				<div class="logo-cover">
					<label class="tool-checkbox">
						<input
							type="checkbox"
							checked={design.coverTitle}
							onchange={(e) => {
								const coverTitle = e.currentTarget.checked
								update((d) => ({ ...d, coverTitle }))
							}}
						/>
						Show the event title on the Luma cover
					</label>
					{#if design.coverTitle}
						<p class="tool-hint">
							Keep it to {LOGO_COVER_TITLE_CHARS} characters or fewer, so it reads at Luma's size.
						</p>
					{/if}
					{#if design.photo}
						<label class="tool-checkbox">
							<input
								type="checkbox"
								checked={design.photoClear}
								onchange={(e) => {
									const photoClear = e.currentTarget.checked
									update((d) => ({ ...d, photoClear }))
								}}
							/>
							Leave the photo clear (no colour over it)
						</label>
					{/if}
				</div>
			{/if}
		</ControlsSection>

		<DesignControls
			{design}
			{update}
			firstSection={2}
			onQrAdded={() => (screenQr = true)}
			onMessage={(m) => (message = m)}
		>
			{#snippet headlineExtras()}
				<TitleSizeControl
					value={headlineScale}
					onChange={(v) => (headlineScale = v)}
					flagged={titleFlagged}
				/>
			{/snippet}
			{#snippet photoExtras()}
				<CropControls
					view={photoView}
					onChange={(patch) => setPhotoView((v) => ({ ...v, ...patch }))}
				/>
			{/snippet}
			{#snippet qrNote()}
				{#if format.kind === 'digital' && format.onPage}
					<p class="tool-hint">
						QR codes are left off the {format.label}, since people are already on the event page.
					</p>
				{:else if format.kind === 'digital' && format.screen}
					<label class="tool-checkbox">
						<input type="checkbox" bind:checked={screenQr} />
						Show QR codes on the {format.label}
					</label>
					{#if !screenQr}
						<p class="tool-hint">
							QR codes are left off social posts by default, since people are already on their
							phone.
						</p>
					{:else if qrReason}
						<p class="tool-hint">{qrReason}</p>
					{/if}
				{:else if qrReason}
					<p class="tool-hint">{qrReason}</p>
				{/if}
			{/snippet}
		</DesignControls>
	{/snippet}
</Studio>

<style>
	.frame {
		display: flex;
		justify-content: center;
		min-height: 200px;
	}

	/* Intrinsic canvas size keeps the aspect ratio while both max-* limits apply. */
	canvas {
		display: block;
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: max(280px, calc(100vh - 330px));
		border: 1px solid var(--grey-150);
		border-radius: 4px;
	}

	canvas[hidden] {
		display: none;
	}

	.draggable {
		cursor: grab;
		touch-action: none;
		user-select: none;
	}

	.draggable:active {
		cursor: grabbing;
	}

	.loading {
		display: grid;
		place-items: center;
		color: var(--text-2);
	}

	.meta {
		margin: 0.75rem 0 0;
		font-size: 0.875rem;
		color: var(--text-2);
		text-align: center;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.625rem;
		margin-top: 1rem;
	}

	.logo-cover {
		display: grid;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}

	@media (max-width: 899px) {
		canvas {
			max-height: 32vh;
		}

		.meta {
			display: none;
		}
	}
</style>
