<script lang="ts">
	import type { Format } from '$lib/collateral/formats'
	import type { LintIssue } from '$lib/collateral/lint'
	import { renderCollateral, type RenderOptions } from '$lib/collateral/render'

	interface Props {
		format: Format
		options: Omit<RenderOptions, 'format'>
		/** This format's own checks, for its badge. */
		issues: LintIssue[]
		active: boolean
		onSelect: () => void
		/** Every check found when drawing, the design's own included. */
		onIssues: (issues: LintIssue[]) => void
	}

	const THUMB_MAX_SIDE = 320

	let { format, options, issues, active, onSelect, onIssues }: Props = $props()
	let canvas: HTMLCanvasElement

	$effect(() => {
		onIssues(
			renderCollateral(canvas, { ...options, format, maxSide: THUMB_MAX_SIDE, lint: true }).issues
		)
	})

	const warnings = $derived(issues.filter((i) => i.level === 'warn').length)
</script>

<!-- One format in the pack, drawn small, with a badge for its checks. Pick it to adjust it. -->
<button type="button" class="thumb" aria-current={active} onclick={onSelect}>
	<canvas bind:this={canvas} aria-hidden="true"></canvas>
	<span class="label">{format.label}</span>
	<span class="badge" class:warn={warnings > 0}>
		{warnings ? `⚠ ${warnings}` : issues.length ? `ℹ ${issues.length}` : '✓'}
	</span>
</button>

<style>
	.thumb {
		position: relative;
		display: grid;
		gap: 0.375rem;
		justify-items: center;
		padding: 0.5rem;
		border: 1px solid var(--grey-300);
		border-radius: 8px;
		background-color: var(--bg);
		color: var(--text);
		font: inherit;
		cursor: pointer;
	}

	.thumb[aria-current='true'] {
		border-color: var(--brand);
		box-shadow: 0 0 0 2px var(--brand);
	}

	.thumb:focus-visible {
		outline: 2px solid var(--text);
		outline-offset: 2px;
	}

	canvas {
		display: block;
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: 110px;
		border-radius: 3px;
	}

	.label {
		font-size: 0.75rem;
		line-height: 1.3;
		text-align: center;
	}

	.badge {
		position: absolute;
		top: 0.25rem;
		right: 0.25rem;
		padding: 0.05rem 0.4rem;
		border-radius: 999px;
		background-color: var(--bg-subtle);
		font-size: 0.7rem;
		font-weight: 700;
	}

	.badge.warn {
		background-color: var(--brand);
		color: var(--black);
	}
</style>
