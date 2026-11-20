<script lang="ts">
	import MaterialsStudio from './MaterialsStudio.svelte'
	import GalleryStudio from './GalleryStudio.svelte'
	import BusinessCardStudio from './BusinessCardStudio.svelte'
	import PackStudio from './PackStudio.svelte'

	type Mode = 'single' | 'pack' | 'gallery' | 'cards'

	/** `short` is shown on phones, where the full labels don't fit in one row. */
	const MODES: { id: Mode; label: string; short: string; hint: string }[] = [
		{ id: 'single', label: 'Single image', short: 'Single', hint: 'One design, one format.' },
		{
			id: 'pack',
			label: 'Campaign pack',
			short: 'Pack',
			hint: 'One design, every format an event needs.'
		},
		{
			id: 'gallery',
			label: 'Gallery / carousel',
			short: 'Gallery',
			hint: 'Photo slides for a carousel post.'
		},
		{
			id: 'cards',
			label: 'Business cards',
			short: 'Cards',
			hint: 'Print-ready business cards, front and back.'
		}
	]

	let mode = $state<Mode>('single')
	// Each mode is set up the first time it's opened, then kept, so switching back keeps its uploaded photos.
	let opened = $state<Mode[]>(['single'])
	$effect(() => {
		if (!opened.includes(mode)) opened = [...opened, mode]
	})
</script>

<!-- A segmented control: always one row of equal segments, with shorter labels on phones. Screen readers hear the
     full name from aria-label. -->
<div class="modes" role="radiogroup" aria-label="Post type">
	{#each MODES as m (m.id)}
		<button
			type="button"
			role="radio"
			aria-checked={mode === m.id}
			aria-label={m.label}
			title={m.hint}
			onclick={() => (mode = m.id)}
		>
			<span class="long" aria-hidden="true">{m.label}</span>
			<span class="short" aria-hidden="true">{m.short}</span>
		</button>
	{/each}
</div>
<p class="hint">{MODES.find((m) => m.id === mode)?.hint}</p>
<div hidden={mode !== 'single'}><MaterialsStudio /></div>
{#if opened.includes('pack')}
	<div hidden={mode !== 'pack'}><PackStudio /></div>
{/if}
{#if opened.includes('gallery')}
	<div hidden={mode !== 'gallery'}><GalleryStudio /></div>
{/if}
{#if opened.includes('cards')}
	<div hidden={mode !== 'cards'}><BusinessCardStudio /></div>
{/if}

<style>
	.modes {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.25rem;
		width: 100%;
		max-width: 44rem;
		padding: 0.25rem;
		border: 1px solid var(--grey-300);
		border-radius: 999px;
	}

	button {
		min-width: 0;
		padding: 0.4rem 0.5rem;
		border: none;
		border-radius: 999px;
		background: none;
		color: var(--text);
		font: inherit;
		font-weight: 700;
		white-space: nowrap;
		cursor: pointer;
	}

	button[aria-checked='true'] {
		background-color: var(--brand);
		color: var(--black);
	}

	button:focus-visible {
		outline: 2px solid var(--text);
		outline-offset: 2px;
	}

	.short {
		display: none;
	}

	@media (max-width: 640px) {
		.long {
			display: none;
		}

		.short {
			display: inline;
		}
	}

	.hint {
		margin: 0.5rem 0 1.5rem;
		font-size: 0.875rem;
		color: var(--text-2);
	}
</style>
