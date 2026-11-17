<script lang="ts">
	import { onMount, untrack } from 'svelte'
	import ControlsSection from '$lib/components/tools/ControlsSection.svelte'
	import Studio from '$lib/components/tools/Studio.svelte'
	import ToolButton from '$lib/components/tools/ToolButton.svelte'
	import {
		canvasToPngBlob,
		downloadFilesZip,
		downloadText,
		exportFilename,
		pdfBytesDigital
	} from '$lib/collateral/export'
	import { DEFAULT_FORMAT_ID, formatDimensionLabel, getFormat } from '$lib/collateral/formats'
	import {
		CAPTION_MAX,
		DEFAULT_SLIDE_PHOTO_SETTINGS,
		EXAMPLE_SLIDE,
		MAX_SLIDES,
		MIN_SLIDES,
		newSlide,
		newSlideId,
		slideRenderOptions,
		type Slide,
		type SlidePhoto
	} from '$lib/collateral/gallery'
	import {
		parseGalleryProject,
		serializeGalleryProject,
		type GalleryProject,
		type GallerySlideData
	} from '$lib/collateral/galleryProject'
	import { LIBRARY_PHOTOS, type LibraryPhoto } from '$lib/collateral/photos'
	import type { PhotoView } from '$lib/collateral/photoTransform'
	import { ALL_PLATFORM_IDS, CAROUSEL_PLATFORMS, type PlatformId } from '$lib/collateral/platforms'
	import type { ProjectPhoto } from '$lib/collateral/project'
	import {
		drawableToJpegDataUrl,
		fileToDrawable,
		loadDataUrl,
		loadImage,
		renderCollateral
	} from '$lib/collateral/render'
	import { DEFAULT_THEME_ID, getTheme } from '$lib/collateral/themes'
	import CharCount from './CharCount.svelte'
	import CropControls from './CropControls.svelte'
	import PhotoLibrary from './PhotoLibrary.svelte'
	import ProjectMenu from './ProjectMenu.svelte'
	import SlideThumb from './SlideThumb.svelte'
	import StylePicker from './StylePicker.svelte'
	import { count } from './count'
	import { photoGestures, StudioAssets } from './studio.svelte'

	const STORAGE_KEY = 'pauseai-collateral-gallery-v1'
	const PREVIEW_MAX_SIDE = 1400
	const MAX_PROJECT_FILE_BYTES = 12_000_000 * MAX_SLIDES
	const RESET_MESSAGE = 'Started a new gallery.'

	/** Slide 1 filled in with an example, slide 2 empty. Falls back to two empty slides if the photo will not load. */
	async function exampleSlides(): Promise<Slide[]> {
		// gallery.test.ts checks the example photo is in the library.
		const item = LIBRARY_PHOTOS.find((p) => p.id === EXAMPLE_SLIDE.photoId)!
		try {
			const drawable = await loadImage(item.src)
			const first: Slide = {
				...newSlide(),
				photo: { drawable, name: item.label, source: { kind: 'library', id: item.id } },
				caption: EXAMPLE_SLIDE.caption
			}
			return [first, newSlide()]
		} catch {
			return [newSlide(), newSlide()]
		}
	}

	/** A distinct crop the selected platforms need, e.g. 4:5 for Instagram and LinkedIn, square for X. */
	interface PreviewCrop {
		formatId: string
		label: string
	}

	let platforms = $state.raw<Set<PlatformId>>(new Set(ALL_PLATFORM_IDS))
	let slides = $state.raw<Slide[]>([newSlide(), newSlide()])
	let activeIndex = $state(0)
	let restored = $state(false)
	let busy = $state(false)
	let message = $state<string | null>(null)
	// Restores what the last Reset cleared. Only offered while the reset message is showing.
	let undoReset = $state.raw<(() => void) | null>(null)
	// Which platform crop the preview shows, when the selected platforms need more than one.
	let previewFormatId = $state<string | null>(null)
	let canvas = $state<HTMLCanvasElement>()

	const assets = new StudioAssets(() => slides.map((s) => s.caption).join(' '))
	// The caption layout never draws the logo, so any style's logo works here: it just satisfies the render API.
	const logo = $derived(assets.logos[getTheme(DEFAULT_THEME_ID).logoSrc] ?? null)

	const previewCrops = $derived.by(() => {
		const crops: PreviewCrop[] = []
		for (const v of CAROUSEL_PLATFORMS) {
			if (!platforms.has(v.platform)) continue
			const crop = crops.find((c) => c.formatId === v.formatId)
			if (crop) crop.label += ` · ${v.label}`
			else crops.push({ formatId: v.formatId, label: v.label })
		}
		return crops
	})
	const previewCrop = $derived(
		previewCrops.find((c) => c.formatId === previewFormatId) ?? previewCrops[0]
	)
	const effectiveFormat = $derived(getFormat(previewCrop?.formatId ?? DEFAULT_FORMAT_ID))
	const activeSlide = $derived(slides[Math.min(activeIndex, slides.length - 1)])
	const activeTheme = $derived(getTheme(activeSlide.themeId))
	const photo = $derived(activeSlide.photo)
	const photoSettings = $derived(activeSlide.photoSettings)

	function updateSlide(id: string, patch: Partial<Slide> | ((s: Slide) => Partial<Slide>)) {
		slides = slides.map((s) =>
			s.id === id ? { ...s, ...(typeof patch === 'function' ? patch(s) : patch) } : s
		)
	}

	function projectPhoto(p: SlidePhoto | null, embed: boolean): ProjectPhoto | null {
		if (!p) return null
		if (p.source.kind === 'library') return { kind: 'library', id: p.source.id }
		return embed
			? { kind: 'upload', name: p.name, dataUrl: drawableToJpegDataUrl(p.drawable) }
			: null
	}

	function currentProject(embed: boolean): GalleryProject {
		return {
			slides: slides.map((s): GallerySlideData => ({
				photo: projectPhoto(s.photo, embed),
				photoSettings: s.photoSettings,
				caption: s.caption,
				themeId: s.themeId
			})),
			platforms: Array.from(platforms)
		}
	}

	/** Loads a saved gallery's photos. `ok` is false if any could not be loaded. */
	async function loadGallery(project: GalleryProject): Promise<{ slides: Slide[]; ok: boolean }> {
		let ok = true
		const loaded = await Promise.all(
			project.slides.map(async (s): Promise<Slide> => {
				const base = {
					id: newSlideId(),
					photoSettings: s.photoSettings,
					caption: s.caption,
					themeId: s.themeId
				}
				const ref = s.photo
				if (!ref) return { ...base, photo: null }
				try {
					if (ref.kind === 'library') {
						// parseGalleryProject only accepts ids in the library.
						const item = LIBRARY_PHOTOS.find((p) => p.id === ref.id)!
						const drawable = await loadImage(item.src)
						return {
							...base,
							photo: { drawable, name: item.label, source: { kind: 'library', id: ref.id } }
						}
					}
					const drawable = await loadDataUrl(ref.dataUrl)
					return { ...base, photo: { drawable, name: ref.name, source: { kind: 'upload' } } }
				} catch {
					ok = false
					return { ...base, photo: null }
				}
			})
		)
		// A gallery always has at least MIN_SLIDES slides.
		while (loaded.length < MIN_SLIDES) loaded.push(newSlide())
		return { slides: loaded, ok }
	}

	function showGallery(project: GalleryProject, loaded: Slide[]) {
		platforms = new Set(project.platforms)
		slides = loaded
		activeIndex = 0
	}

	// Opens a gallery file. Returns false if any photo could not be loaded.
	async function applyProject(project: GalleryProject): Promise<boolean> {
		const { slides: loaded, ok } = await loadGallery(project)
		showGallery(project, loaded)
		return ok
	}

	// Restore the last session once, or start from the example. If the volunteer has already started while its
	// photos loaded, their slides are kept.
	onMount(() => {
		const start = { slides, platforms }
		const untouched = () => slides === start.slides && platforms === start.platforms
		void (async () => {
			let result: ReturnType<typeof parseGalleryProject> | null = null
			try {
				const raw = localStorage.getItem(STORAGE_KEY)
				result = raw ? parseGalleryProject(raw) : null
			} catch {
				// Storage can be blocked (private windows etc). The tool works without it.
			}
			if (result?.ok) {
				const { slides: loaded } = await loadGallery(result.project)
				if (untouched()) showGallery(result.project, loaded)
			} else {
				const example = await exampleSlides()
				if (untouched()) slides = example
			}
			restored = true
		})()
	})

	// Autosave, a moment after the last change. Uploaded photos are not kept (too big for browser storage), library
	// photos are.
	$effect(() => {
		if (!restored) return
		const project = currentProject(false)
		const timer = setTimeout(() => {
			try {
				localStorage.setItem(STORAGE_KEY, serializeGalleryProject(project))
			} catch {
				// Storage can be blocked or full. The tool works without it.
			}
		}, 400)
		return () => clearTimeout(timer)
	})

	// Live preview of the active slide, redrawn on every change.
	$effect(() => {
		if (!canvas || !logo || !assets.fontsLoaded) return
		renderCollateral(canvas, {
			...slideRenderOptions(activeSlide, effectiveFormat, logo),
			maxSide: PREVIEW_MAX_SIDE
		})
	})

	// Drag, pinch and scroll the photo on the preview, for the active slide.
	function setPhotoView(fn: (v: PhotoView) => PhotoView) {
		updateSlide(activeSlide.id, (s) => ({
			photoSettings: { ...s.photoSettings, ...fn(s.photoSettings) }
		}))
	}
	const gestures = photoGestures({
		canvas: () => canvas,
		photo: () => photo?.drawable ?? null,
		view: () => photoSettings,
		setView: setPhotoView
	})

	/**
	 * One photo replaces the current slide's. Several fill the current slide, then the later slides that have
	 * no photo yet, then new slides up to the limit, one photo each.
	 */
	async function onPhotos(files: File[]) {
		if (files.length === 0) return
		message = null
		// Where the photos go is decided by the slide showing when they were picked.
		const startIndex = activeIndex
		const results = await Promise.allSettled(files.map((file) => fileToDrawable(file)))
		const loaded: SlidePhoto[] = []
		results.forEach((r, i) => {
			if (r.status === 'fulfilled')
				loaded.push({ drawable: r.value, name: files[i].name, source: { kind: 'upload' } })
		})
		const failed = results.length - loaded.length
		const withPhoto = (s: Slide, p: SlidePhoto): Slide => ({
			...s,
			photo: p,
			photoSettings: { ...DEFAULT_SLIDE_PHOTO_SETTINGS }
		})
		const queue = [...loaded]
		const next = slides.map((s, i) => {
			const takes = i === startIndex || (i > startIndex && !s.photo)
			return takes && queue.length ? withPhoto(s, queue.shift()!) : s
		})
		while (queue.length && next.length < MAX_SLIDES)
			next.push(withPhoto(newSlide(), queue.shift()!))
		slides = next
		const left = queue.length
		if (failed || left) {
			message = [
				failed && `${count(failed, 'image', 'images')} could not be read.`,
				left && `${left} did not fit: a gallery holds ${MAX_SLIDES} slides.`
			]
				.filter(Boolean)
				.join(' ')
		}
	}

	async function onLibraryPhoto(item: LibraryPhoto) {
		message = null
		// The slide that was showing when the photo was picked, even if another is picked while it loads.
		const slideId = activeSlide.id
		try {
			const drawable = await loadImage(item.src)
			updateSlide(slideId, {
				photo: { drawable, name: item.label, source: { kind: 'library', id: item.id } },
				photoSettings: { ...DEFAULT_SLIDE_PHOTO_SETTINGS }
			})
		} catch {
			message = 'Could not load that photo.'
		}
	}

	// The slide buttons below are disabled at the limits, so these never go past them.
	function addSlide() {
		slides = [...slides, newSlide()]
		activeIndex = slides.length - 1
	}

	function removeSlide(index: number) {
		slides = slides.filter((_, i) => i !== index)
		activeIndex = Math.min(activeIndex, slides.length - 1)
	}

	function moveSlide(index: number, dir: -1 | 1) {
		const target = index + dir
		const next = [...slides]
		;[next[index], next[target]] = [next[target], next[index]]
		slides = next
		activeIndex = target
	}

	function togglePlatform(id: PlatformId) {
		// A new set each time: platforms is replaced, not changed in place.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const next = new Set(platforms)
		if (next.has(id)) next.delete(id)
		else next.add(id)
		platforms = next
	}

	// The download button is disabled until the logo and fonts have loaded, and while no platform is ticked.
	async function onDownloadForPlatforms() {
		busy = true
		message = null
		try {
			const files: { name: string; data: Blob | Uint8Array }[] = []
			// Instagram and LinkedIn share a crop, so each slide is drawn once per crop. One canvas at a time, encoded
			// straight away, so a phone never holds every full-size slide at once.
			const pngs: Record<string, { png: Blob; width: number; height: number }[]> = {}
			for (const variant of CAROUSEL_PLATFORMS) {
				if (!platforms.has(variant.platform)) continue
				let all = pngs[variant.formatId]
				if (!all) {
					const fmt = getFormat(variant.formatId)
					all = []
					for (const slide of slides) {
						const c = document.createElement('canvas')
						renderCollateral(c, slideRenderOptions(slide, fmt, logo))
						all.push({ png: await canvasToPngBlob(c), width: c.width, height: c.height })
					}
					pngs[variant.formatId] = all
				}
				const used = all.slice(0, variant.maxSlides)
				used.forEach((p, i) =>
					files.push({ name: `${variant.platform}/${i + 1}.png`, data: p.png })
				)
				if (variant.export === 'both') {
					files.push({
						name: `${variant.platform}/${exportFilename([variant.platform, 'carousel'], 'pdf')}`,
						data: await pdfBytesDigital(used)
					})
				}
			}
			await downloadFilesZip(files, exportFilename(['gallery', 'platforms'], 'zip'))
		} catch {
			message = 'Could not create the export. Try again, or with fewer slides.'
		} finally {
			busy = false
		}
	}

	function onSaveProject() {
		message = null
		try {
			downloadText(
				serializeGalleryProject(currentProject(true)),
				exportFilename(['gallery', 'project'], 'json'),
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
			message = 'That file is too big to be a saved gallery.'
			return
		}
		const result = parseGalleryProject(await file.text())
		if (!result.ok) {
			message = result.error
			return
		}
		const ok = await applyProject(result.project)
		message = ok
			? `Opened ${file.name}.`
			: `Opened ${file.name}, but some photos could not be loaded.`
	}

	// Undo restores the slides from before the reset, so it's only offered until the next change.
	let afterReset: { slides: Slide[]; platforms: Set<PlatformId> } | null = null
	$effect(() => {
		const changed = slides !== afterReset?.slides || platforms !== afterReset.platforms
		if (!changed || !untrack(() => undoReset)) return
		undoReset = null
		afterReset = null
		if (untrack(() => message) === RESET_MESSAGE) message = null
	})

	async function onReset() {
		const before = { slides, activeIndex, platforms }
		slides = await exampleSlides()
		activeIndex = 0
		platforms = new Set(ALL_PLATFORM_IDS)
		afterReset = { slides, platforms }
		message = RESET_MESSAGE
		undoReset = () => {
			slides = before.slides
			activeIndex = before.activeIndex
			platforms = before.platforms
			undoReset = null
			message = null
		}
	}

	const ready = $derived(!busy && Boolean(logo) && assets.fontsReady)
	const shown = $derived(message ?? assets.error)
</script>

<Studio>
	{#snippet preview()}
		<div class="pin">
			<div class="frame">
				<canvas
					bind:this={canvas}
					aria-label={`Preview of slide ${activeIndex + 1} of ${slides.length}`}
					hidden={!(logo && assets.fontsReady)}
					class:draggable={Boolean(photo)}
					{...gestures}
				></canvas>
				{#if !(logo && assets.fontsReady)}
					<p class="meta">Loading…</p>
				{/if}
			</div>
			{#if logo && assets.fontsReady}
				<div class="filmstrip" role="group" aria-label="All slides">
					{#each slides as s, i (s.id)}
						<SlideThumb
							fontsLoaded={assets.fontsLoaded}
							slide={s}
							format={effectiveFormat}
							{logo}
							index={i}
							active={i === activeIndex}
							onSelect={() => (activeIndex = i)}
						/>
					{/each}
				</div>
			{/if}
		</div>
		<p class="meta">
			Slide {activeIndex + 1} of {slides.length} ·
			{previewCrop
				? `Crop for ${previewCrop.label} · ${formatDimensionLabel(effectiveFormat)}`
				: formatDimensionLabel(effectiveFormat)}{#if photo}
				· Drag the photo to move it. Scroll or pinch to zoom.{/if}
		</p>
		{#if previewCrops.length > 1}
			<div class="crops" role="group" aria-label="Preview crop">
				{#each previewCrops as c (c.formatId)}
					<button
						type="button"
						aria-pressed={c.formatId === previewCrop?.formatId}
						onclick={() => (previewFormatId = c.formatId)}
					>
						{c.label}
					</button>
				{/each}
			</div>
		{/if}
		<div class="actions">
			<ToolButton
				variant="primary"
				onclick={onDownloadForPlatforms}
				disabled={!ready || platforms.size === 0}
				pending={busy}
			>
				Download slides
			</ToolButton>
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
		<ControlsSection heading="1. Platforms">
			<p class="tool-hint">One download gives each platform its own crop.</p>
			<div class="platforms" role="group" aria-label="Platforms">
				{#each CAROUSEL_PLATFORMS as v (v.platform)}
					<label class="platform" class:checked={platforms.has(v.platform)}>
						<span>
							<input
								type="checkbox"
								checked={platforms.has(v.platform)}
								onchange={() => togglePlatform(v.platform)}
							/>
							<strong>{v.label}</strong>
						</span>
						<span class="note">
							{v.note}{#if slides.length > v.maxSlides}
								— only the first {v.maxSlides} will be included{/if}
						</span>
					</label>
				{/each}
			</div>
			{#if platforms.size === 0}
				<p class="tool-hint">Pick at least one platform.</p>
			{/if}
		</ControlsSection>

		<ControlsSection heading={`2. Slide ${activeIndex + 1} of ${slides.length}`}>
			<p class="tool-hint">Pick a slide from the strip under the preview.</p>
			<div class="slide-actions">
				<ToolButton
					size="small"
					disabled={activeIndex === 0}
					onclick={() => moveSlide(activeIndex, -1)}>← Move earlier</ToolButton
				>
				<ToolButton
					size="small"
					disabled={activeIndex === slides.length - 1}
					onclick={() => moveSlide(activeIndex, 1)}>Move later →</ToolButton
				>
				<ToolButton
					size="small"
					disabled={slides.length <= MIN_SLIDES}
					onclick={() => removeSlide(activeIndex)}>Remove</ToolButton
				>
				<ToolButton size="small" disabled={slides.length >= MAX_SLIDES} onclick={addSlide}>
					Add a slide ({slides.length} of {MAX_SLIDES})
				</ToolButton>
			</div>
		</ControlsSection>

		<ControlsSection heading="3. Style">
			<p class="tool-hint">Each slide can have its own colour.</p>
			<StylePicker
				themeId={activeTheme.id}
				onTheme={(themeId: string) => updateSlide(activeSlide.id, { themeId })}
			/>
		</ControlsSection>

		<ControlsSection heading="4. Caption">
			<textarea
				id="gallery-caption"
				class="tool-input"
				aria-label={`Caption for slide ${activeIndex + 1}`}
				rows="3"
				maxlength={CAPTION_MAX}
				value={activeSlide.caption}
				oninput={(e) => updateSlide(activeSlide.id, { caption: e.currentTarget.value })}></textarea>
			<CharCount value={activeSlide.caption} max={CAPTION_MAX} />
		</ControlsSection>

		<ControlsSection heading="5. Photo">
			<PhotoLibrary
				currentId={photo?.source.kind === 'library' ? photo.source.id : null}
				onPick={onLibraryPhoto}
			/>
			<p class="tool-hint">Or upload your own. Pick several to fill a slide each:</p>
			<input
				class="tool-file"
				type="file"
				accept="image/*"
				multiple
				aria-label="Upload photos"
				onchange={(e) => {
					// Copy the files before clearing the input, so picking the same files again still fires.
					const files = Array.from(e.currentTarget.files ?? [])
					e.currentTarget.value = ''
					void onPhotos(files)
				}}
			/>
			{#if photo}
				<div>
					<p class="tool-hint">
						{photo.name} · stays in your browser
						<button
							type="button"
							class="tool-link"
							onclick={() => updateSlide(activeSlide.id, { photo: null })}>Remove</button
						>
					</p>
					<CropControls
						view={photoSettings}
						onChange={(patch: Partial<PhotoView>) =>
							updateSlide(activeSlide.id, (s) => ({
								photoSettings: { ...s.photoSettings, ...patch }
							}))}
					/>
				</div>
			{/if}
		</ControlsSection>
	{/snippet}
</Studio>

<style>
	.frame {
		display: flex;
		justify-content: center;
		min-height: 200px;
	}

	canvas {
		display: block;
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: max(280px, calc(100vh - 420px));
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

	.filmstrip {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.75rem;
		padding: 0.25rem;
		overflow-x: auto;
	}

	.meta {
		margin: 0.75rem 0 0;
		font-size: 0.875rem;
		color: var(--text-2);
		text-align: center;
	}

	.crops {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.crops button {
		padding: 0.25rem 0.75rem;
		border: 1px solid var(--grey-300);
		border-radius: 999px;
		background-color: var(--bg);
		color: var(--text);
		font: inherit;
		font-size: 0.8rem;
		cursor: pointer;
	}

	.crops button[aria-pressed='true'] {
		border-color: var(--brand);
		box-shadow: 0 0 0 2px var(--brand);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.625rem;
		margin-top: 1rem;
	}

	.platforms {
		display: grid;
		gap: 0.5rem;
	}

	.platform {
		display: grid;
		gap: 0.125rem;
		padding: 0.75rem 0.875rem;
		border: 1px solid var(--grey-300);
		border-radius: 8px;
		cursor: pointer;
	}

	.platform.checked {
		border-color: var(--brand);
		box-shadow: 0 0 0 2px var(--brand);
	}

	.platform input {
		margin-right: 0.5rem;
		accent-color: var(--brand);
	}

	.note {
		font-size: 0.8rem;
		color: var(--text-2);
	}

	.slide-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	@media (max-width: 899px) {
		canvas {
			max-height: 28vh;
		}
	}
</style>
