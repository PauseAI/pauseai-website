<script lang="ts">
	import { onMount, untrack } from 'svelte'
	import { StudioAssets } from './studio.svelte'
	import { subsetsFor } from '$lib/materials/canvasFonts'
	import ControlsSection from '$lib/components/tools/ControlsSection.svelte'
	import Studio from '$lib/components/tools/Studio.svelte'
	import ToolButton from '$lib/components/tools/ToolButton.svelte'
	import {
		CARD_FIELDS,
		CARD_SIDES,
		cardDefaults,
		cardMissing,
		parseCardSave,
		SAFE_MM,
		type CardFace
	} from '$lib/materials/businessCards'
	import { CARD_FONT_FACES } from '$lib/materials/cardFonts'
	import { cardPreviewCanvas, renderCardFace } from '$lib/materials/cardRender'
	import { CHAPTER_CHOICES, chapterName, getChapter } from '$lib/materials/chapters'
	import { downloadCanvasPdf, downloadCanvasPng, exportFilename } from '$lib/materials/export'
	import {
		BLEED_MM,
		CARD_FORMATS,
		DEFAULT_CARD_FORMAT_ID,
		formatDimensionLabel,
		getCardFormat
	} from '$lib/materials/formats'
	import { sameIssues, type LintIssue } from '$lib/materials/lint'
	import type { Drawable, Values } from '$lib/materials/templates'
	import { getTheme } from '$lib/materials/themes'
	import Checks from './Checks.svelte'
	import CharCount from './CharCount.svelte'

	const STORAGE_KEY = 'pauseai-business-card-v1'
	const PREVIEW_MAX_SIDE = 900

	let formatId = $state(DEFAULT_CARD_FORMAT_ID)
	let chapterId = $state('')
	/** Only what the volunteer typed. The rest comes from the chapter's defaults, so changing country updates the QR link. */
	let edited = $state<Values>({})
	let issues = $state.raw<LintIssue[]>([])
	let restored = $state(false)
	let busy = $state<'png' | 'pdf' | null>(null)
	let message = $state<string | null>(null)
	/** The preview canvases, one per side, in CARD_SIDES order. */
	let canvases = $state<HTMLCanvasElement[]>([])

	const format = $derived(getCardFormat(formatId))
	const chapter = $derived(getChapter(chapterId))
	const values = $derived({ ...cardDefaults(chapter), ...edited })
	const designText = $derived(CARD_FIELDS.map((f) => values[f.key] ?? '').join(' '))

	const assets = new StudioAssets(() => designText, CARD_FONT_FACES)
	// The orange style's logo: white circle, black PAUSE.
	const logo: Drawable | null = $derived(assets.logos[getTheme('orange').logoSrc] ?? null)
	// The first name and email are required: the downloads wait for them, and say what is missing.
	const missing = $derived(cardMissing(values))
	const ready = $derived(
		!busy &&
			!missing &&
			Boolean(logo) &&
			subsetsFor(designText).every((s) => (assets.fontsLoaded ?? '').split(',').includes(s))
	)

	onMount(() => {
		try {
			const saved = parseCardSave(localStorage.getItem(STORAGE_KEY))
			formatId = saved.formatId
			chapterId = saved.chapterId
			edited = saved.edited
		} catch {
			// Storage can be blocked (private windows etc). The tool works without it.
		}
		restored = true
	})

	$effect(() => {
		if (!restored) return
		const data = JSON.stringify({ formatId, chapterId, edited })
		const timer = setTimeout(() => {
			try {
				localStorage.setItem(STORAGE_KEY, data)
			} catch {
				// Storage can be blocked or full. The tool works without it.
			}
		}, 400)
		return () => clearTimeout(timer)
	})

	// Live preview of both sides, redrawn whenever anything changes, and again once more fonts load.
	$effect(() => {
		if (!logo || !assets.fontsLoaded || CARD_SIDES.some((_, i) => !canvases[i])) return
		const found: LintIssue[] = []
		CARD_SIDES.forEach(({ face }, i) => {
			const { issues: faceIssues } = renderCardFace(canvases[i], {
				format,
				face,
				values,
				logo,
				maxSide: PREVIEW_MAX_SIDE
			})
			for (const issue of faceIssues) if (!found.some((f) => f.id === issue.id)) found.push(issue)
		})
		if (
			!sameIssues(
				untrack(() => issues),
				found
			)
		)
			issues = found
	})

	function setValue(key: string, value: string) {
		edited = { ...edited, [key]: value }
	}

	function renderSide(face: CardFace, bleed: boolean): HTMLCanvasElement {
		const c = document.createElement('canvas')
		renderCardFace(c, { format, face, values, logo: logo!, bleed })
		return c
	}

	function filename(ext: string): string {
		return exportFilename(['business-card', format.id], ext)
	}

	async function onDownloadPdf() {
		busy = 'pdf'
		message = null
		try {
			const pages = CARD_SIDES.map(({ face }) => renderSide(face, true))
			await downloadCanvasPdf(pages, format, BLEED_MM, filename('pdf'))
		} catch {
			message = 'Could not create the PDF. Try again.'
		} finally {
			busy = null
		}
	}

	async function onDownloadPng() {
		busy = 'png'
		message = null
		try {
			const [one, two] = CARD_SIDES.map(({ face }) => renderSide(face, false))
			const preview = cardPreviewCanvas(one, two)
			await downloadCanvasPng(preview, filename('png'))
		} catch {
			message = 'Could not create the image.'
		} finally {
			busy = null
		}
	}
</script>

<Studio>
	{#snippet preview()}
		<div class="cards">
			{#each CARD_SIDES as { label }, i (label)}
				<figure>
					<canvas
						bind:this={canvases[i]}
						aria-label={`${label} of the business card`}
						hidden={!logo}
					></canvas>
					<figcaption>{label}</figcaption>
				</figure>
			{/each}
			{#if !logo}
				<p class="loading">Loading…</p>
			{/if}
		</div>
		<p class="meta">
			{format.label} · {formatDimensionLabel(format)} · Keep to the card: the print PDF adds {BLEED_MM}
			mm of bleed, and text stays {SAFE_MM} mm inside the edge.
		</p>
		<div class="actions">
			<Checks {issues} />
			{#if missing}
				<p class="missing" role="status">{missing}</p>
			{/if}
			<ToolButton
				variant="primary"
				onclick={onDownloadPdf}
				disabled={!ready}
				pending={busy === 'pdf'}
			>
				Download print PDF (both sides, +{BLEED_MM} mm bleed)
			</ToolButton>
			<ToolButton onclick={onDownloadPng} disabled={!ready} pending={busy === 'png'}>
				Download PNG preview
			</ToolButton>
			{#if message ?? assets.error}
				<p class="tool-status" role="status">{message ?? assets.error}</p>
			{/if}
		</div>
	{/snippet}

	{#snippet controls()}
		<ControlsSection heading="1. Card size">
			<label class="tool-label" for="card-format">Where will it be printed?</label>
			<select id="card-format" class="tool-select" bind:value={formatId}>
				{#each CARD_FORMATS as f (f.id)}
					<option value={f.id}>{f.label} ({formatDimensionLabel(f)})</option>
				{/each}
			</select>
		</ControlsSection>

		<ControlsSection heading="2. Country">
			<label class="tool-label" for="card-chapter">Which PauseAI is it for?</label>
			<select id="card-chapter" class="tool-select" bind:value={chapterId}>
				{#each CHAPTER_CHOICES as c (c.id)}
					<option value={c.id}>{c.label}</option>
				{/each}
			</select>
			<p class="tool-hint">
				The QR code opens {chapterName(chapter)}'s link unless you give another.
			</p>
		</ControlsSection>

		<ControlsSection heading="3. Your details">
			{#each CARD_FIELDS as field (field.key)}
				{@const id = `card-${field.key}`}
				{@const value = values[field.key] ?? ''}
				<div class="tool-field">
					<label class="tool-label" for={id}
						>{field.label}{#if field.hint}<span class="tool-note"> · {field.hint}</span>{/if}</label
					>
					{#if field.kind === 'textarea'}
						<textarea
							{id}
							class="tool-input"
							rows="2"
							maxlength={field.maxLength}
							{value}
							oninput={(e) => setValue(field.key, e.currentTarget.value)}></textarea>
					{:else}
						<input
							{id}
							class="tool-input"
							type="text"
							maxlength={field.maxLength}
							{value}
							oninput={(e) => setValue(field.key, e.currentTarget.value)}
						/>
					{/if}
					<CharCount {value} max={field.maxLength} />
				</div>
			{/each}
			<button type="button" class="tool-link" onclick={() => (edited = {})}>
				Clear my details
			</button>
		</ControlsSection>
	{/snippet}
</Studio>

<style>
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr));
		gap: 1rem;
		align-items: start;
	}

	figure {
		margin: 0;
	}

	canvas {
		display: block;
		width: 100%;
		height: auto;
		border: 1px solid var(--grey-150);
		border-radius: 6px;
	}

	canvas[hidden] {
		display: none;
	}

	figcaption {
		margin-top: 0.375rem;
		font-size: 0.875rem;
		color: var(--text-2);
		text-align: center;
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

	.missing {
		flex-basis: 100%;
		margin: 0;
		font-weight: 700;
		text-align: center;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.625rem;
		margin-top: 1rem;
	}

	@media (max-width: 899px) {
		.meta {
			display: none;
		}
	}
</style>
