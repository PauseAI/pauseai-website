<script lang="ts">
	import { onMount, untrack } from 'svelte'
	import { StudioAssets } from './studio.svelte'
	import { subsetsFor } from '$lib/collateral/canvasFonts'
	import ControlsSection from '$lib/components/tools/ControlsSection.svelte'
	import Studio from '$lib/components/tools/Studio.svelte'
	import ToolButton from '$lib/components/tools/ToolButton.svelte'
	import {
		CARD_DESIGNS,
		cardDefaults,
		cardFieldsFor,
		DEFAULT_CARD_DESIGN_ID,
		getCardDesign,
		parseCardSave,
		SAFE_MM,
		type CardFace
	} from '$lib/collateral/businessCards'
	import { CARD_FONT_FACES } from '$lib/collateral/cardFonts'
	import { cardPreviewCanvas, renderCardFace } from '$lib/collateral/cardRender'
	import { CHAPTER_CHOICES, chapterName, getChapter } from '$lib/collateral/chapters'
	import { downloadCanvasPdf, downloadCanvasPng, exportFilename } from '$lib/collateral/export'
	import {
		BLEED_MM,
		CARD_FORMATS,
		DEFAULT_CARD_FORMAT_ID,
		formatDimensionLabel,
		getCardFormat
	} from '$lib/collateral/formats'
	import { sameIssues, type LintIssue } from '$lib/collateral/lint'
	import type { Values } from '$lib/collateral/templates'
	import { getTheme } from '$lib/collateral/themes'
	import Checks from './Checks.svelte'
	import CharCount from './CharCount.svelte'

	const STORAGE_KEY = 'pauseai-business-card-v1'
	const PREVIEW_MAX_SIDE = 900

	let designId = $state(DEFAULT_CARD_DESIGN_ID)
	let formatId = $state(DEFAULT_CARD_FORMAT_ID)
	let chapterId = $state('')
	/** Only what the volunteer typed. The rest comes from the chapter's defaults, so changing country updates the QR link. */
	let edited = $state<Values>({})
	let issues = $state.raw<LintIssue[]>([])
	let restored = $state(false)
	let busy = $state<'png' | 'pdf' | null>(null)
	let message = $state<string | null>(null)
	let frontCanvas = $state<HTMLCanvasElement>()
	let backCanvas = $state<HTMLCanvasElement>()

	const design = $derived(getCardDesign(designId))
	const format = $derived(getCardFormat(formatId))
	const chapter = $derived(getChapter(chapterId))
	const fields = $derived(cardFieldsFor(design))
	const values = $derived({ ...cardDefaults(chapter), ...edited })
	const designText = $derived(fields.map((f) => values[f.key] ?? '').join(' '))

	const assets = new StudioAssets(() => designText, CARD_FONT_FACES)
	const logos = $derived.by(() => {
		const light = assets.logos[getTheme('orange').logoSrc]
		const onWhite = assets.logos[getTheme('cream').logoSrc]
		return light && onWhite ? { light, onWhite } : null
	})
	const ready = $derived(
		!busy &&
			Boolean(logos) &&
			subsetsFor(designText).every((s) => (assets.fontsLoaded ?? '').split(',').includes(s))
	)

	const sides = $derived<{ side: 'front' | 'back'; face: CardFace }[]>([
		{ side: 'front', face: design.front },
		{ side: 'back', face: design.back }
	])

	onMount(() => {
		try {
			const saved = parseCardSave(localStorage.getItem(STORAGE_KEY))
			designId = saved.designId
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
		const data = JSON.stringify({ designId, formatId, chapterId, edited })
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
		if (!logos || !assets.fontsLoaded || !frontCanvas || !backCanvas) return
		const found: LintIssue[] = []
		const canvases = { front: frontCanvas, back: backCanvas }
		for (const { side, face } of sides) {
			const { issues: faceIssues } = renderCardFace(canvases[side], {
				format,
				face,
				values,
				logos,
				maxSide: PREVIEW_MAX_SIDE
			})
			for (const issue of faceIssues) if (!found.some((i) => i.id === issue.id)) found.push(issue)
		}
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
		renderCardFace(c, { format, face, values, logos: logos!, bleed })
		return c
	}

	function filename(ext: string): string {
		return exportFilename(['business-card', design.id, format.id], ext)
	}

	async function onDownloadPdf() {
		busy = 'pdf'
		message = null
		try {
			const pages = sides.map(({ face }) => renderSide(face, true))
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
			const preview = cardPreviewCanvas(
				renderSide(design.front, false),
				renderSide(design.back, false)
			)
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
			{#each sides as { side } (side)}
				<figure>
					{#if side === 'front'}
						<canvas
							bind:this={frontCanvas}
							aria-label={`Front of the ${design.label} business card`}
							hidden={!logos}
						></canvas>
					{:else}
						<canvas
							bind:this={backCanvas}
							aria-label={`Back of the ${design.label} business card`}
							hidden={!logos}
						></canvas>
					{/if}
					<figcaption>{side === 'front' ? 'Front' : 'Back'}</figcaption>
				</figure>
			{/each}
			{#if !logos}
				<p class="loading">Loading…</p>
			{/if}
		</div>
		<p class="meta">
			{format.label} · {formatDimensionLabel(format)} · Keep to the card: the print PDF adds {BLEED_MM}
			mm of bleed, and text stays {SAFE_MM} mm inside the edge.
		</p>
		<div class="actions">
			<Checks {issues} />
			<ToolButton
				variant="primary"
				onclick={onDownloadPdf}
				disabled={!ready}
				pending={busy === 'pdf'}
			>
				Download print PDF (front and back, +{BLEED_MM} mm bleed)
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
		<ControlsSection heading="1. Design">
			<div class="choices" role="radiogroup" aria-label="Design">
				{#each CARD_DESIGNS as d (d.id)}
					<button
						type="button"
						role="radio"
						aria-checked={d.id === design.id}
						class="choice"
						onclick={() => (designId = d.id)}
					>
						<strong>{d.label}</strong>
						<span>{d.description}</span>
					</button>
				{/each}
			</div>
		</ControlsSection>

		<ControlsSection heading="2. Card size">
			<label class="tool-label" for="card-format">Where will it be printed?</label>
			<select id="card-format" class="tool-select" bind:value={formatId}>
				{#each CARD_FORMATS as f (f.id)}
					<option value={f.id}>{f.label} ({formatDimensionLabel(f)})</option>
				{/each}
			</select>
		</ControlsSection>

		<ControlsSection heading="3. Country">
			<label class="tool-label" for="card-chapter">Which PauseAI is it for?</label>
			<select id="card-chapter" class="tool-select" bind:value={chapterId}>
				{#each CHAPTER_CHOICES as c (c.id)}
					<option value={c.id}>{c.label}</option>
				{/each}
			</select>
			<p class="tool-hint">
				{#if design.id === 'connect'}
					The QR code opens {chapterName(chapter)}'s link unless you give another.
				{:else}
					Sets the link the Connect design's QR code opens.
				{/if}
			</p>
		</ControlsSection>

		<ControlsSection heading="4. Your details">
			{#each fields as field (field.key)}
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

	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.625rem;
		margin-top: 1rem;
	}

	.choices {
		display: grid;
		gap: 0.5rem;
	}

	.choice {
		display: grid;
		gap: 0.125rem;
		padding: 0.75rem 0.875rem;
		border: 1px solid var(--grey-300);
		border-radius: 8px;
		background-color: var(--bg);
		color: var(--text);
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.choice span {
		font-size: 0.8rem;
		color: var(--text-2);
	}

	.choice[aria-checked='true'] {
		border-color: var(--brand);
		box-shadow: 0 0 0 2px var(--brand);
	}

	.choice:focus-visible {
		outline: 2px solid var(--text);
		outline-offset: 2px;
	}

	@media (max-width: 899px) {
		.meta {
			display: none;
		}
	}
</style>
