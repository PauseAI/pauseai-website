<script lang="ts">
	import { THEMES } from '$lib/collateral/themes'

	let { themeId, onTheme }: { themeId: string; onTheme: (id: string) => void } = $props()
</script>

<!-- The style swatches, each a chip in its colours. How strongly the colour covers a photo is picked automatically,
     so there is nothing else to set. -->
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
				<i class="accent" style:background-color={t.accent}></i>
			</span>
			{t.label}
		</button>
	{/each}
</div>

<style>
	.swatches {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
	}

	.swatch {
		display: grid;
		gap: 8px;
		justify-items: center;
		padding: 10px 8px;
		border: 1px solid var(--grey-300);
		border-radius: 8px;
		background-color: var(--bg);
		color: var(--text);
		font: inherit;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
	}

	.swatch[aria-checked='true'] {
		border-color: var(--brand);
		box-shadow: 0 0 0 2px var(--brand);
	}

	.swatch:focus-visible {
		outline: 2px solid var(--brand);
		outline-offset: 2px;
	}

	.chip {
		display: flex;
		align-items: flex-end;
		width: 100%;
		height: 56px;
		padding: 8px;
		border: 1px solid var(--grey-300);
		border-radius: 6px;
	}

	.accent {
		display: block;
		width: 40%;
		height: 10px;
		border-radius: 999px;
	}
</style>
