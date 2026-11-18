<script lang="ts">
	import {
		clampHeadlineScale,
		HEADLINE_SCALE_MAX,
		HEADLINE_SCALE_MIN,
		HEADLINE_SCALE_STEP
	} from '$lib/collateral/design'

	interface Props {
		value: number
		onChange: (v: number) => void
		/** The checks flag the title, so the control opens. */
		flagged: boolean
	}

	let { value, onChange, flagged }: Props = $props()
	const percent = $derived(Math.round(value * 100))
</script>

<!-- Nudges the title size when automatic sizing gets it wrong: closed unless the checks flag the title. -->
<details class="tool-details" open={flagged || value !== 1 || undefined}>
	<summary>Adjust title size</summary>
	<p class="tool-hint">
		Sizing is automatic and should look right. Only adjust it if the preview looks off.
	</p>
	<div class="stepper" role="group" aria-label="Title size">
		<button
			type="button"
			aria-label="Smaller title"
			disabled={value <= HEADLINE_SCALE_MIN}
			onclick={() => onChange(clampHeadlineScale(value - HEADLINE_SCALE_STEP))}>−</button
		>
		<span aria-live="polite">{value === 1 ? 'Automatic' : `${percent}%`}</span>
		<button
			type="button"
			aria-label="Bigger title"
			disabled={value >= HEADLINE_SCALE_MAX}
			onclick={() => onChange(clampHeadlineScale(value + HEADLINE_SCALE_STEP))}>+</button
		>
		{#if value !== 1}
			<button type="button" class="tool-link" onclick={() => onChange(1)}>Back to automatic</button>
		{/if}
	</div>
</details>

<style>
	.stepper {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.stepper span {
		min-width: 5.5rem;
		text-align: center;
	}

	.stepper button:not(.tool-link) {
		width: 2rem;
		height: 2rem;
		border: 1px solid var(--grey-300);
		border-radius: 6px;
		background-color: var(--bg);
		color: var(--text);
		font-size: 1.1rem;
		cursor: pointer;
	}

	.stepper button:disabled {
		opacity: 0.4;
		cursor: default;
	}
</style>
