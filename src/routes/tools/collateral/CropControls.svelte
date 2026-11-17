<script lang="ts">
	import { MAX_ZOOM, type PhotoView } from '$lib/collateral/photoTransform'

	interface Props {
		view: PhotoView
		onChange: (patch: Partial<PhotoView>) => void
	}

	let { view, onChange }: Props = $props()

	const sliders: { key: keyof PhotoView; label: string; min: number; max: number; step: number }[] =
		[
			{ key: 'zoom', label: 'Zoom', min: 1, max: MAX_ZOOM, step: 0.05 },
			{ key: 'focalX', label: 'Left / right', min: 0, max: 1, step: 0.01 },
			{ key: 'focalY', label: 'Up / down', min: 0, max: 1, step: 0.01 }
		]
</script>

<!-- Zoom and position sliders. Dragging, scrolling and pinching the preview do the same; these keep the crop
     adjustable from a keyboard. -->
<details class="tool-details">
	<summary>Fine-tune the crop</summary>
	{#each sliders as s (s.key)}
		<label class="slider">
			<span>{s.label}</span>
			<input
				type="range"
				min={s.min}
				max={s.max}
				step={s.step}
				value={view[s.key]}
				oninput={(e) => onChange({ [s.key]: Number(e.currentTarget.value) })}
			/>
		</label>
	{/each}
</details>

<style>
	.slider {
		display: grid;
		grid-template-columns: 7rem 1fr;
		align-items: center;
		gap: 0.75rem;
		margin-top: 0.5rem;
		font-size: 0.875rem;
	}

	input {
		width: 100%;
		accent-color: var(--brand);
	}
</style>
