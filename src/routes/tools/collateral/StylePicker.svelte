<script lang="ts">
	import { THEMES } from '$lib/collateral/themes'

	let { themeId, onTheme }: { themeId: string; onTheme: (id: string) => void } = $props()
</script>

<!-- The style swatches. How strongly the colour covers a photo is picked automatically, so there is nothing else to set. -->
<div class="swatches" role="radiogroup" aria-label="Style">
	{#each THEMES as t (t.id)}
		<button
			type="button"
			role="radio"
			aria-checked={t.id === themeId}
			class="swatch"
			onclick={() => onTheme(t.id)}
		>
			<span class="chip" style:background-color={t.bg} aria-hidden="true">
				<i style:background-color={t.accent}></i>
			</span>
			{t.label}
		</button>
	{/each}
</div>

<style>
	.swatches {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.swatch {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.75rem 0.375rem 0.375rem;
		border: 1px solid var(--grey-300);
		border-radius: 999px;
		background-color: var(--bg);
		color: var(--text);
		font: inherit;
		cursor: pointer;
	}

	.swatch[aria-checked='true'] {
		border-color: var(--brand);
		box-shadow: 0 0 0 2px var(--brand);
	}

	.swatch:focus-visible {
		outline: 2px solid var(--text);
		outline-offset: 2px;
	}

	.chip {
		position: relative;
		width: 1.75rem;
		height: 1.75rem;
		border: 1px solid var(--grey-300);
		border-radius: 50%;
	}

	.chip i {
		position: absolute;
		right: 0.25rem;
		bottom: 0.25rem;
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
	}
</style>
