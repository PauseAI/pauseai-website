<script lang="ts">
	import type { Snippet } from 'svelte'
	import ControlsSection from '$lib/components/tools/ControlsSection.svelte'
	import ToolButton from '$lib/components/tools/ToolButton.svelte'
	import type { ToolsEventsResponse } from '$api/tools/events/+server'
	import {
		CHAPTER_CHOICES,
		chapterName,
		eventsLink,
		getChapter,
		printableLink
	} from '$lib/collateral/chapters'
	import { MAX_PARTNER_LOGOS, QR_SIZES } from '$lib/collateral/design'
	import {
		eventDayLabel,
		eventFieldValues,
		eventLink,
		type CalendarEvent
	} from '$lib/collateral/eventText'
	import { isLumaEventLink } from '$lib/collateral/lint'
	import { LIBRARY_PHOTOS, type LibraryPhoto } from '$lib/collateral/photos'
	import { QR_LABEL_MAX, QR_URL_MAX } from '$lib/collateral/project'
	import { MAX_QR_CODES, normaliseUrl, type QrCode } from '$lib/collateral/qr'
	import {
		drawableToPngDataUrl,
		fileToDrawable,
		loadDataUrl,
		loadImage
	} from '$lib/collateral/render'
	import { getTemplate } from '$lib/collateral/templates'
	import CharCount from './CharCount.svelte'
	import StylePicker from './StylePicker.svelte'
	import {
		DESIGN_TEMPLATES,
		designDefaults,
		designQrCodes,
		designTemplate,
		designValues,
		withChapter,
		withQrCodes,
		type DesignState
	} from './designState'

	interface Props {
		design: DesignState
		update: (fn: (d: DesignState) => DesignState) => void
		/** Number of the first section here, since the studio puts its own sections before. */
		firstSection: number
		/** Extra photo controls from the studio, e.g. fine crop controls. */
		photoExtras?: Snippet
		/** Shown under the headline field, e.g. the title size nudge. */
		headlineExtras?: Snippet
		/** Shown under the QR codes when there are some: e.g. whether they show on the current format, and why. */
		qrNote?: Snippet
		/** Called when a volunteer adds a QR code, e.g. to show codes on a format that leaves them out by default. */
		onQrAdded?: () => void
		onMessage: (message: string | null) => void
	}

	let {
		design,
		update,
		firstSection,
		photoExtras,
		headlineExtras,
		qrNote,
		onQrAdded,
		onMessage
	}: Props = $props()

	const template = $derived(designTemplate(design))
	const values = $derived(designValues(design))
	const qrCodes = $derived(designQrCodes(design))
	const chapter = $derived(getChapter(design.chapterId))
	const n = (i: number) => firstSection + i

	const sameUrl = (a: string, b: string) =>
		normaliseUrl(a).toLowerCase() === normaliseUrl(b).toLowerCase()

	// Upcoming events from the chapter's Luma calendar, or PauseAI's when it has none, for "start from an event".
	let events = $state.raw<CalendarEvent[]>([])
	const eventsFrom = $derived(chapter.lumaCalendarId ? chapterName(chapter) : 'PauseAI')
	$effect(() => {
		const id = design.chapterId
		let cancelled = false
		events = []
		fetch(`/api/tools/events?chapter=${encodeURIComponent(id)}`)
			.then((res) => (res.ok ? (res.json() as Promise<ToolsEventsResponse>) : []))
			.then((list) => {
				if (!cancelled) events = list
			})
			.catch(() => {
				// The tool works without events: the option is just not offered.
			})
		return () => {
			cancelled = true
		}
	})

	function setValue(key: string, value: string) {
		update((d) => ({
			...d,
			valuesByTemplate: {
				...d.valuesByTemplate,
				[template.id]: { ...designValues(d), [key]: value }
			}
		}))
	}

	function importEvent(id: string) {
		const ev = events.find((e) => e.id === id)
		if (!ev) return
		const filled = eventFieldValues(ev, eventsLink(chapter))
		const link = eventLink(ev)
		update((d) => {
			const before = {
				...designDefaults(d, getTemplate('event')),
				...d.valuesByTemplate.event
			}
			// The first QR code opens the event itself, replacing any code for the old address or an earlier imported event.
			const current = d.qrCodesByTemplate.event ?? []
			const replaced = current.filter(
				(c) => (before.url && sameUrl(c.url, before.url)) || isLumaEventLink(c.url)
			)
			const others = current.filter((c) => !replaced.includes(c))
			const codes = [{ label: replaced[0]?.label || 'Scan to RSVP', url: link }, ...others].slice(
				0,
				MAX_QR_CODES
			)
			const event = { ...before, ...filled, group: filled.group || before.group }
			return {
				...d,
				templateId: 'event',
				valuesByTemplate: { ...d.valuesByTemplate, event },
				qrCodesByTemplate: { ...d.qrCodesByTemplate, event: codes }
			}
		})
		onMessage(
			`Filled in from “${ev.name}” with the Event layout. The QR code opens the event, and the printed link is the events page. Check the text before you download.`
		)
	}

	// The first code opens the design's own web address, since that is almost always where it should go.
	// Later codes start blank, so two codes never quietly point at the same place.
	function newQr(): QrCode {
		if (qrCodes.length > 0) return { label: '', url: '' }
		return {
			label: template.id === 'event' ? 'Scan to RSVP' : 'Scan to join',
			url: values.url.trim() || printableLink(chapter)
		}
	}

	function updateQr(index: number, patch: Partial<QrCode>) {
		update((d) =>
			withQrCodes(
				d,
				designQrCodes(d).map((c, i) => (i === index ? { ...c, ...patch } : c))
			)
		)
	}

	async function onPhoto(file: File | undefined) {
		if (!file) return
		onMessage(null)
		try {
			const drawable = await fileToDrawable(file)
			update((d) => ({ ...d, photo: { drawable, name: file.name, source: { kind: 'upload' } } }))
		} catch {
			onMessage('Could not read that image. Try a JPG or PNG.')
		}
	}

	async function onLibraryPhoto(item: LibraryPhoto) {
		onMessage(null)
		try {
			const drawable = await loadImage(item.src)
			update((d) => ({
				...d,
				photo: { drawable, name: item.label, source: { kind: 'library', id: item.id } }
			}))
		} catch {
			onMessage('Could not load that photo.')
		}
	}

	async function onPartnerLogo(file: File | undefined) {
		if (!file) return
		onMessage(null)
		try {
			// Downscaled and re-encoded as PNG, so it stays small enough to save with the project and keeps transparency.
			const dataUrl = drawableToPngDataUrl(await fileToDrawable(file))
			const drawable = await loadDataUrl(dataUrl)
			update((d) => ({
				...d,
				partnerLogos: [...d.partnerLogos, { name: file.name, dataUrl, drawable }].slice(
					0,
					MAX_PARTNER_LOGOS
				)
			}))
		} catch {
			onMessage('Could not read that logo. Try a PNG with a transparent background.')
		}
	}

	const currentLibraryId = $derived(
		design.photo?.source.kind === 'library' ? design.photo.source.id : null
	)
</script>

<ControlsSection heading={`${n(0)}. Country`}>
	<label class="tool-label" for="collateral-chapter">Which PauseAI is it for?</label>
	<select
		id="collateral-chapter"
		class="tool-select"
		value={design.chapterId}
		onchange={(e) => {
			const id = e.currentTarget.value
			update((d) => withChapter(d, id))
		}}
	>
		{#each CHAPTER_CHOICES as c (c.id)}
			<option value={c.id}>{c.label}</option>
		{/each}
	</select>
	<p class="tool-hint">
		{#if chapter.id}
			Puts “{chapter.shortName.toUpperCase()}” at the top, and fills in {chapterName(chapter)}'s
			link.
		{:else}
			For PauseAI as a whole. Pick a country to put its name at the top and use its national group's
			link.
		{/if}
	</p>
</ControlsSection>

<ControlsSection heading={`${n(1)}. Layout`}>
	<div class="choices" role="radiogroup" aria-label="Layout">
		{#each DESIGN_TEMPLATES as t (t.id)}
			<button
				type="button"
				role="radio"
				aria-checked={t.id === template.id}
				class="choice"
				onclick={() => update((d) => ({ ...d, templateId: t.id }))}
			>
				<strong>{t.label}</strong>
				<span>{t.description}</span>
			</button>
		{/each}
	</div>
	<!-- Right under the Event card, which is last in the list. Kept outside the radio group, which may only hold its options. -->
	{#if events.length > 0}
		<div class="event-import" class:active={template.id === 'event'}>
			<label class="tool-label" for="collateral-import-event"
				>Start from one of {eventsFrom}'s events</label
			>
			<select
				id="collateral-import-event"
				class="tool-select"
				value=""
				onchange={(e) => {
					importEvent(e.currentTarget.value)
					e.currentTarget.value = ''
				}}
			>
				<option value="">Choose an event…</option>
				{#each events as ev (ev.id)}
					<option value={ev.id}>{eventDayLabel(ev)} · {ev.name}</option>
				{/each}
			</select>
			<p class="tool-hint">Fills in the Event layout, and adds a QR code for the event.</p>
		</div>
	{/if}
</ControlsSection>

<ControlsSection heading={`${n(2)}. Style`}>
	<StylePicker
		themeId={design.themeId}
		onTheme={(themeId: string) => update((d) => ({ ...d, themeId }))}
	/>
</ControlsSection>

<ControlsSection heading={`${n(3)}. Text`}>
	{#each template.fields as field (field.key)}
		{@const id = `collateral-${template.id}-${field.key}`}
		{@const value = values[field.key]}
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
			{:else if field.kind === 'date' || field.kind === 'time'}
				<input
					{id}
					class="tool-input"
					type={field.kind}
					{value}
					oninput={(e) => setValue(field.key, e.currentTarget.value)}
				/>
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
			{#if field.key === 'headline'}
				{@render headlineExtras?.()}
			{/if}
		</div>
	{/each}
</ControlsSection>

<ControlsSection heading={`${n(4)}. QR codes (optional)`}>
	{#each qrCodes as code, i (i)}
		<div class="qr-row">
			<div class="qr-fields">
				<input
					class="tool-input"
					type="text"
					aria-label={`QR code ${i + 1} label`}
					placeholder="Label under the code, e.g. RSVP"
					maxlength={QR_LABEL_MAX}
					value={code.label}
					oninput={(e) => updateQr(i, { label: e.currentTarget.value })}
				/>
				<input
					class="tool-input"
					type="text"
					aria-label={`QR code ${i + 1} web address`}
					placeholder={`Web address, e.g. ${printableLink(chapter)}`}
					maxlength={QR_URL_MAX}
					value={code.url}
					oninput={(e) => updateQr(i, { url: e.currentTarget.value })}
				/>
				<CharCount value={code.url} max={QR_URL_MAX} />
			</div>
			<button
				type="button"
				class="qr-remove"
				aria-label={`Remove QR code ${i + 1}`}
				onclick={() =>
					update((d) =>
						withQrCodes(
							d,
							designQrCodes(d).filter((_, j) => j !== i)
						)
					)}>×</button
			>
		</div>
	{/each}
	<ToolButton
		size="small"
		disabled={qrCodes.length >= MAX_QR_CODES}
		onclick={() => {
			const code = newQr()
			update((d) => withQrCodes(d, [...designQrCodes(d), code]))
			onQrAdded?.()
		}}
	>
		{qrCodes.length === 0 ? 'Add a QR code' : `Add another (${qrCodes.length} of ${MAX_QR_CODES})`}
	</ToolButton>
	{#if qrCodes.length > 0}
		<div class="qr-size" role="radiogroup" aria-label="QR code size">
			<span class="tool-label">Size</span>
			{#each QR_SIZES as s (s.id)}
				<label class="tool-checkbox">
					<input
						type="radio"
						name="collateral-qr-size"
						checked={design.qrSize === s.id}
						onchange={() => update((d) => ({ ...d, qrSize: s.id }))}
					/>
					{s.label}
				</label>
			{/each}
		</div>
		<!-- UTM tagging is switched off until we have a way to read the results. See qrTarget in $lib/collateral/qr.ts. -->
		{@render qrNote?.()}
	{/if}
</ControlsSection>

<ControlsSection heading={`${n(5)}. Photo (optional)`}>
	<div class="photos">
		{#each LIBRARY_PHOTOS as item (item.id)}
			<button
				type="button"
				class="photo"
				aria-label={item.label}
				aria-pressed={currentLibraryId === item.id}
				title={item.label}
				onclick={() => onLibraryPhoto(item)}
				style:background-image={`url(${item.thumb})`}
			></button>
		{/each}
	</div>
	<p class="tool-hint">Or upload your own:</p>
	<input
		class="tool-file"
		type="file"
		accept="image/*"
		aria-label="Upload a photo"
		onchange={(e) => {
			void onPhoto(e.currentTarget.files?.[0])
			e.currentTarget.value = ''
		}}
	/>
	{#if design.photo}
		<div>
			<p class="tool-hint">
				{design.photo.name} · stays in your browser
				<button
					type="button"
					class="tool-link"
					onclick={() => update((d) => ({ ...d, photo: null }))}>Remove</button
				>
			</p>
			{@render photoExtras?.()}
		</div>
	{/if}
</ControlsSection>

<ControlsSection heading={`${n(6)}. Partner logos (optional)`}>
	<p class="tool-hint">For joint events. A PNG with a transparent background works best.</p>
	{#each design.partnerLogos as logo, i (`${logo.name}-${i}`)}
		<p class="tool-hint">
			{logo.name}
			<button
				type="button"
				class="tool-link"
				onclick={() =>
					update((d) => ({ ...d, partnerLogos: d.partnerLogos.filter((_, j) => j !== i) }))}
				>Remove</button
			>
		</p>
	{/each}
	{#if design.partnerLogos.length < MAX_PARTNER_LOGOS}
		<input
			class="tool-file"
			type="file"
			accept="image/png,image/jpeg,image/webp"
			aria-label="Upload a partner logo"
			onchange={(e) => {
				void onPartnerLogo(e.currentTarget.files?.[0])
				e.currentTarget.value = ''
			}}
		/>
	{/if}
</ControlsSection>

<style>
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

	.choice[aria-checked='true'],
	.photo[aria-pressed='true'] {
		border-color: var(--brand);
		box-shadow: 0 0 0 2px var(--brand);
	}

	.choice:focus-visible,
	.photo:focus-visible,
	.qr-remove:focus-visible {
		outline: 2px solid var(--text);
		outline-offset: 2px;
	}

	.event-import {
		margin-top: 0.75rem;
		padding: 0.75rem;
		border: 1px dashed var(--grey-300);
		border-radius: 8px;
	}

	.event-import.active {
		border-style: solid;
		border-color: var(--brand);
	}

	.qr-row {
		display: flex;
		gap: 0.5rem;
		align-items: flex-start;
		margin-bottom: 0.75rem;
	}

	.qr-fields {
		display: grid;
		flex: 1;
		gap: 0.375rem;
		min-width: 0;
	}

	.qr-remove {
		width: 2.25rem;
		height: 2.25rem;
		border: 1px solid var(--grey-300);
		border-radius: 8px;
		background-color: var(--bg);
		color: var(--text);
		font-size: 1.2rem;
		cursor: pointer;
	}

	.qr-size {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: center;
		margin: 0.75rem 0 0.5rem;
	}

	.qr-size .tool-label {
		margin: 0;
	}

	.photos {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.photo {
		aspect-ratio: 4 / 3;
		padding: 0;
		border: 1px solid var(--grey-300);
		border-radius: 6px;
		background-color: var(--bg-subtle);
		background-position: center;
		background-size: cover;
		cursor: pointer;
	}
</style>
