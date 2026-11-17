<script lang="ts">
	import CollateralStudio from './CollateralStudio.svelte'
	import GalleryStudio from './GalleryStudio.svelte'
	import PackStudio from './PackStudio.svelte'

	type Mode = 'single' | 'pack' | 'gallery'

	const MODES: { id: Mode; label: string; hint: string }[] = [
		{ id: 'single', label: 'Single image', hint: 'One design, one format.' },
		{ id: 'pack', label: 'Campaign pack', hint: 'One design, every format an event needs.' },
		{ id: 'gallery', label: 'Gallery / carousel', hint: 'Photo slides for a carousel post.' }
	]

	let mode = $state<Mode>('single')
	// Each mode is set up the first time it's opened, then kept, so switching back keeps its uploaded photos.
	let opened = $state<Mode[]>(['single'])
	$effect(() => {
		if (!opened.includes(mode)) opened = [...opened, mode]
	})
</script>

<div class="modes" role="radiogroup" aria-label="Post type">
	{#each MODES as m (m.id)}
		<button
			type="button"
			role="radio"
			aria-checked={mode === m.id}
			title={m.hint}
			onclick={() => (mode = m.id)}
		>
			{m.label}
		</button>
	{/each}
</div>
<p class="hint">{MODES.find((m) => m.id === mode)?.hint}</p>
<div hidden={mode !== 'single'}><CollateralStudio /></div>
{#if opened.includes('pack')}
	<div hidden={mode !== 'pack'}><PackStudio /></div>
{/if}
{#if opened.includes('gallery')}
	<div hidden={mode !== 'gallery'}><GalleryStudio /></div>
{/if}

<style>
	.modes {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		padding: 0.25rem;
		border: 1px solid var(--grey-300);
		border-radius: 999px;
	}

	button {
		padding: 0.4rem 1rem;
		border: none;
		border-radius: 999px;
		background: none;
		color: var(--text);
		font: inherit;
		font-weight: 700;
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

	.hint {
		margin: 0.5rem 0 1.5rem;
		font-size: 0.875rem;
		color: var(--text-2);
	}
</style>
