<script lang="ts">
	import { untrack } from 'svelte'
	import type { Format } from '$lib/materials/formats'
	import type { LintIssue } from '$lib/materials/lint'
	import { renderDesign, type RenderOptions } from '$lib/materials/render'

	interface Props {
		/** The font subsets loaded so far: drawn again when more load. */
		fontsLoaded: string | null
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

	let { fontsLoaded, format, options, issues, active, onSelect, onIssues }: Props = $props()
	let canvas: HTMLCanvasElement

	// What it was last drawn with. A crop or title size changed on another format rebuilds every thumbnail's
	// options, but each part is the same object as before unless it changed, so most need no redraw.
	let last: {
		options: Omit<RenderOptions, 'format'>
		format: Format
		fonts: string | null
	} | null = null
	const same = (a: Omit<RenderOptions, 'format'>, b: Omit<RenderOptions, 'format'>) =>
		(Object.keys(a) as (keyof typeof a)[]).every((k) =>
			k === 'partnerLogos'
				? a.partnerLogos?.length === b.partnerLogos?.length &&
					(a.partnerLogos ?? []).every((l, i) => l === b.partnerLogos?.[i])
				: a[k] === b[k]
		)

	$effect(() => {
		const fonts = fontsLoaded
		if (last && last.format === format && last.fonts === fonts && same(last.options, options))
			return
		last = { options, format, fonts }
		const { issues } = renderDesign(canvas, {
			...options,
			format,
			maxSide: THUMB_MAX_SIDE,
			lint: true
		})
		untrack(() => onIssues(issues))
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
