<script lang="ts">
	import { onMount } from 'svelte'
	import ControlsSection from '$lib/components/tools/ControlsSection.svelte'
	import Studio from '$lib/components/tools/Studio.svelte'
	import ToolButton from '$lib/components/tools/ToolButton.svelte'
	import {
		canvasToPngBlob,
		downloadFilesZip,
		downloadText,
		exportFilename,
		pdfBytesForPrint
	} from '$lib/collateral/export'
	import {
		BLEED_MM,
		FORMAT_GROUPS,
		FORMATS,
		formatDimensionLabel,
		previewStyle
	} from '$lib/collateral/formats'
	import { sameIssues, splitByScope, type LintIssue } from '$lib/collateral/lint'
	import {
		DEFAULT_PACK_FORMAT_IDS,
		DEFAULT_PHOTO_VIEW,
		parsePackProject,
		serializePackProject,
		type PackProject
	} from '$lib/collateral/packProject'
	import type { PhotoView } from '$lib/collateral/photoTransform'
	import { renderCollateral, type RenderOptions } from '$lib/collateral/render'
	import { LOGO_COVER_TITLE_CHARS, type Drawable } from '$lib/collateral/templates'
	import { CLEAR_PHOTO_LOGO_SRC, getTheme } from '$lib/collateral/themes'
	import Checks from './Checks.svelte'
	import CropControls from './CropControls.svelte'
	import DesignControls from './DesignControls.svelte'
	import PackThumb from './PackThumb.svelte'
	import ProjectMenu from './ProjectMenu.svelte'
	import TitleSizeControl from './TitleSizeControl.svelte'
	import { count } from './count'
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
	import { photoGestures, StudioAssets } from './studio.svelte'

	const RESET_MESSAGE = 'Reset to the example text.'
	const STORAGE_KEY = 'pauseai-collateral-pack-v1'
	const PREVIEW_MAX_SIDE = 1400
	const MAX_PROJECT_FILE_BYTES = 12_000_000
	const TITLE_ISSUES = ['text-overflow', 'title-small']

	/** Photo crops per format, valid only for the photo they were set on, so a new photo starts centred everywhere. */
	interface ViewsState {
		photo: Drawable | null
		views: Record<string, PhotoView>
	}

	let design = $state.raw<DesignState>(newDesign('event'))
	let selected = $state.raw<string[]>(DEFAULT_PACK_FORMAT_IDS)
	let activeId = $state(DEFAULT_PACK_FORMAT_IDS[0])
	let headlineScales = $state.raw<Record<string, number>>({})
	// Screen formats (social posts) that show QR codes anyway. They are left out of those by default.
	let screenQrs = $state.raw<Record<string, boolean>>({})
	let viewsState = $state.raw<ViewsState>({ photo: null, views: {} })
	let issuesById = $state.raw<Record<string, LintIssue[]>>({})
	let restored = $state(false)
	let busy = $state(false)
	let message = $state<string | null>(null)
	let undoReset = $state.raw<(() => void) | null>(null)
	let canvas = $state<HTMLCanvasElement>()

	const assets = new StudioAssets(() => designText)

	const template = $derived(designTemplate(design))
	const theme = $derived(getTheme(design.themeId))
	const values = $derived(designValues(design))
	const logo = $derived(assets.logos[theme.logoSrc] ?? null)
	const ready = $derived(!busy && Boolean(logo) && assets.fontsReady)
	const formats = $derived(FORMATS.filter((f) => selected.includes(f.id)))
	const active = $derived(formats.find((f) => f.id === activeId) ?? formats[0])
	const designText = $derived(
		[
			...Object.values(values),
			designCountry(design),
			...designQrCodes(design).map((c) => c.label)
		].join(' ')
	)

	const currentPhoto = $derived(design.photo?.drawable ?? null)
	function viewFor(id: string): PhotoView {
		return (
			(viewsState.photo === currentPhoto ? viewsState.views[id] : undefined) ?? DEFAULT_PHOTO_VIEW
		)
	}
	const activeView = $derived(active ? viewFor(active.id) : DEFAULT_PHOTO_VIEW)
	// Only the preview and crop controls call this, and they are only shown for an active format.
	function setActiveView(fn: (v: PhotoView) => PhotoView) {
		const id = active!.id
		const views = viewsState.photo === currentPhoto ? viewsState.views : {}
		viewsState = {
			photo: currentPhoto,
			views: { ...views, [id]: fn(views[id] ?? DEFAULT_PHOTO_VIEW) }
		}
	}
	const gestures = photoGestures({
		canvas: () => canvas,
		photo: () => currentPhoto,
		view: () => activeView,
		setView: setActiveView
	})

	function update(fn: (d: DesignState) => DesignState) {
		design = fn(design)
	}

	function currentProject(embedUploads: boolean): PackProject {
		return {
			...designToData(design, embedUploads),
			outputs: formats.map((f) => ({
				formatId: f.id,
				photoView: viewFor(f.id),
				headlineScale: headlineScales[f.id] ?? 1,
				screenQr: screenQrs[f.id] ?? false
			}))
		}
	}

	async function applyProject(project: PackProject): Promise<boolean> {
		const { design: loaded, ok } = await designFromData(project)
		design = loaded
		selected = project.outputs.map((o) => o.formatId)
		headlineScales = Object.fromEntries(project.outputs.map((o) => [o.formatId, o.headlineScale]))
		screenQrs = Object.fromEntries(project.outputs.map((o) => [o.formatId, o.screenQr]))
		viewsState = {
			photo: loaded.photo?.drawable ?? null,
			views: Object.fromEntries(project.outputs.map((o) => [o.formatId, o.photoView]))
		}
		return ok
	}

	onMount(() => {
		void (async () => {
			try {
				const raw = localStorage.getItem(STORAGE_KEY)
				const result = raw ? parsePackProject(raw) : null
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
		const project = serializePackProject(currentProject(false))
		try {
			localStorage.setItem(STORAGE_KEY, project)
		} catch {
			// Ignore, see above.
		}
	})

	function optionsFor(formatId: string): Omit<RenderOptions, 'format'> {
		return {
			template,
			theme,
			values,
			country: designCountry(design),
			logo: logo!,
			photo: currentPhoto,
			photoSettings: viewFor(formatId),
			qrCodes: designQrCodes(design),
			trackQr: design.trackQr,
			qrSize: design.qrSize,
			photoClear: design.photoClear,
			coverTitle: design.coverTitle,
			clearPhotoLogo: assets.logos[CLEAR_PHOTO_LOGO_SRC],
			screenQr: screenQrs[formatId] ?? false,
			headlineScale: headlineScales[formatId] ?? 1,
			partnerLogos: design.partnerLogos.map((l) => l.drawable)
		}
	}

	// The large preview of the format being adjusted. Its checks come from the thumbnails.
	$effect(() => {
		if (!canvas || !logo || !assets.fontsLoaded || !active) return
		renderCollateral(canvas, {
			...optionsFor(active.id),
			format: active,
			maxSide: PREVIEW_MAX_SIDE
		})
	})

	function onIssues(id: string, found: LintIssue[]) {
		if (issuesById[id] && sameIssues(issuesById[id], found)) return
		issuesById = { ...issuesById, [id]: found }
	}

	function toggleFormat(id: string) {
		selected = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]
	}

	// The download button is disabled until the logo and fonts have loaded, and while no format is ticked.
	async function onDownloadPack() {
		busy = true
		message = null
		try {
			const files: { name: string; data: Blob | Uint8Array }[] = []
			// One format at a time, so only one big canvas is in memory.
			for (const f of formats) {
				const c = document.createElement('canvas')
				renderCollateral(c, { ...optionsFor(f.id), format: f })
				files.push({ name: `${f.id}.png`, data: await canvasToPngBlob(c) })
				if (f.kind === 'print') {
					renderCollateral(c, { ...optionsFor(f.id), format: f, bleed: true })
					files.push({ name: `${f.id}-print.pdf`, data: await pdfBytesForPrint([c], f, BLEED_MM) })
				}
			}
			await downloadFilesZip(files, exportFilename([template.id, 'pack'], 'zip'))
		} catch {
			message = 'Could not create the pack. Try with fewer formats.'
		} finally {
			busy = false
		}
	}

	function onSaveProject() {
		message = null
		try {
			downloadText(
				serializePackProject(currentProject(true)),
				exportFilename([template.id, 'pack', 'project'], 'json'),
				'application/json'
			)
			message = 'Pack file saved. Open it from the ⋯ menu to carry on editing.'
		} catch {
			message = 'Could not save the pack.'
		}
	}

	async function onOpenProject(file: File | undefined) {
		if (!file) return
		message = null
		if (file.size > MAX_PROJECT_FILE_BYTES) {
			message = 'That file is too big to be a saved pack.'
			return
		}
		const result = parsePackProject(await file.text())
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
		const before = { design, selected, headlineScales, viewsState }
		const t = template
		design = {
			...withQrCodes(design, []),
			valuesByTemplate: { ...design.valuesByTemplate, [t.id]: designDefaults(design, t) },
			photo: null,
			partnerLogos: []
		}
		headlineScales = {}
		message = RESET_MESSAGE
		undoReset = () => {
			design = before.design
			selected = before.selected
			headlineScales = before.headlineScales
			viewsState = before.viewsState
			undoReset = null
			message = null
		}
	}

	// Problems in the design itself (its text or QR codes) are the same on every format, so they are listed once,
	// and each format's badge and count only cover what depends on that format.
	const split = $derived(splitByScope(formats.map((f) => issuesById[f.id] ?? [])))
	const ownIssues = $derived(Object.fromEntries(formats.map((f, i) => [f.id, split.own[i]])))
	const needAttention = $derived(
		formats.filter((f) => ownIssues[f.id].some((i) => i.level === 'warn')).length
	)
	const activeIssues = $derived(active ? ownIssues[active.id] : [])
	const designWarnings = $derived(split.design.filter((i) => i.level === 'warn').length)
	const summary = $derived(
		formats.length === 0
			? 'Tick at least one format.'
			: [
					designWarnings &&
						`${count(designWarnings, 'problem affects', 'problems affect')} every format.`,
					needAttention
						? `${needAttention} of ${formats.length} formats need a look of their own.`
						: designWarnings
							? 'Otherwise every format passed its checks.'
							: 'Every format passed the checks.'
				]
					.filter(Boolean)
					.join(' ')
	)
	const shown = $derived(message ?? assets.error)
	const hasLogoCover = $derived(formats.some((f) => f.kind === 'digital' && f.logoCover))
</script>

<Studio pinOnPhones={false}>
	{#snippet preview()}
		<!-- Overview first: every format with its checks, then the one being adjusted, larger. -->
		<div class="pack">
			{#if logo && assets.fontsReady && formats.length > 0}
				<div class="grid" role="group" aria-label="Formats in the pack. Pick one to adjust it.">
					{#each formats as f (f.id)}
						<PackThumb
							format={f}
							options={optionsFor(f.id)}
							issues={ownIssues[f.id]}
							active={f.id === active?.id}
							onSelect={() => (activeId = f.id)}
							onIssues={(found) => onIssues(f.id, found)}
						/>
					{/each}
				</div>
			{/if}
			<div class="actions">
				{#if split.design.length > 0}
					<Checks issues={split.design} title="Checks for every format" />
				{/if}
				<p class="summary">{summary}</p>
				<ToolButton
					variant="primary"
					onclick={onDownloadPack}
					disabled={!ready || formats.length === 0}
					pending={busy}
				>
					Download {count(formats.length, 'format', 'formats')} (.zip)
				</ToolButton>
				<ProjectMenu
					noun="pack"
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
			{#if active}
				{@const width = previewStyle(active)?.width}
				<div class="frame">
					<canvas
						bind:this={canvas}
						aria-label={`Preview of ${active.label}`}
						hidden={!(logo && assets.fontsReady)}
						class:draggable={Boolean(design.photo)}
						style:width={width ? `${width}px` : undefined}
						{...gestures}
					></canvas>
				</div>
				<p class="meta">
					Adjusting {active.label} · {formatDimensionLabel(active)}{#if design.photo}
						· Drag the photo to fit this format. Scroll or pinch to zoom.{/if}
				</p>
			{:else}
				<p class="meta">Tick at least one format.</p>
			{/if}
		</div>
	{/snippet}

	{#snippet controls()}
		<DesignControls {design} {update} firstSection={1} onMessage={(m) => (message = m)} />

		<ControlsSection heading="8. Formats">
			<p class="tool-hint">
				One download gives you every ticked format, each laid out for its size.
			</p>
			{#each FORMAT_GROUPS as group (group)}
				<fieldset>
					<legend>{group}</legend>
					{#each FORMATS.filter((f) => f.group === group) as f (f.id)}
						<label class="tool-checkbox">
							<input
								type="checkbox"
								checked={selected.includes(f.id)}
								onchange={() => toggleFormat(f.id)}
							/>
							<span>{f.label} <span class="size">{formatDimensionLabel(f)}</span></span>
						</label>
					{/each}
				</fieldset>
			{/each}
			{#if hasLogoCover}
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
						Leave the photo clear on the Luma cover (no colour over it)
					</label>
				{/if}
			{/if}
		</ControlsSection>

		{#if active}
			{@const id = active.id}
			<ControlsSection heading={`Adjust ${active.label}`}>
				<p class="tool-hint">
					Changes here only apply to this format. Pick another format from the previews.
				</p>
				<Checks issues={activeIssues} title={`Checks for ${active.label}`} />
				<TitleSizeControl
					value={headlineScales[id] ?? 1}
					onChange={(v) => (headlineScales = { ...headlineScales, [id]: v })}
					flagged={activeIssues.some((i) => TITLE_ISSUES.includes(i.id))}
				/>
				{#if designQrCodes(design).length > 0}
					{#if active.kind === 'digital' && active.onPage}
						<p class="tool-hint">
							QR codes are left off the {active.label}, since people are already on the event page.
						</p>
					{:else if active.kind === 'digital' && active.screen}
						<label class="tool-checkbox">
							<input
								type="checkbox"
								checked={screenQrs[id] ?? false}
								onchange={(e) => {
									const on = e.currentTarget.checked
									screenQrs = { ...screenQrs, [id]: on }
								}}
							/>
							Show QR codes on the {active.label}
						</label>
					{/if}
				{/if}
				{#if design.photo}
					<CropControls
						view={activeView}
						onChange={(patch) => setActiveView((v) => ({ ...v, ...patch }))}
					/>
				{/if}
			</ControlsSection>
		{/if}
	{/snippet}
</Studio>

<style>
	.pack {
		display: grid;
		gap: 1rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
		gap: 0.625rem;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.625rem;
		align-items: stretch;
	}

	.summary {
		flex-basis: 100%;
		margin: 0;
		font-size: 0.875rem;
		color: var(--text-2);
	}

	.frame {
		display: flex;
		justify-content: center;
	}

	canvas {
		display: block;
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: 56vh;
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

	.meta {
		margin: 0;
		font-size: 0.875rem;
		color: var(--text-2);
		text-align: center;
	}

	fieldset {
		display: grid;
		gap: 0.375rem;
		margin: 0 0 0.75rem;
		padding: 0;
		border: 0;
	}

	legend {
		margin-bottom: 0.375rem;
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--text-2);
	}

	.size {
		font-size: 0.75rem;
		color: var(--text-2);
	}
</style>
