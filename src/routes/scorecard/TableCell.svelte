<script lang="ts">
	export let score: number | undefined = undefined
	export let explanation: string = undefined
	export let showExplanation: boolean
	export let title: string | undefined = undefined
	let showTooltip = false
	let color: string | undefined

	$: {
		if (score !== undefined) {
			if (score >= 9) {
				color = 'green'
			} else if (score <= 1) {
				color = 'red'
			} else {
				const percentage = (score - 1) / 8
				const red = Math.round(255 * (1 - percentage))
				const green = Math.round(255 * percentage)
				color = `rgb(${red}, ${green}, 0)`
			}
		}
	}
</script>

<td on:mouseover={() => (showTooltip = true)} on:mouseout={() => (showTooltip = false)}>
	{#if title !== undefined}
		<div class="title">
			{title}
		</div>
	{/if}
	{#if score !== undefined}
		<div class="score" style="color: {color}">
			{score}
		</div>
	{/if}
	{#if showExplanation}
		<div class="explanation">
			{explanation}
		</div>
	{/if}
	{#if !showExplanation && showTooltip}
		<div class="tooltip">
			{explanation}
		</div>
	{/if}
</td>

<style>
	.title {
		font-weight: bold;
	}
	.score {
		font-size: 1.2rem;
		font-weight: bold;
	}

	.explanation {
		font-size: 0.8rem;
		opacity: 0.7;
		min-width: 10rem;
	}

	.tooltip {
		position: absolute;
		background: var(--bg);
		border: 1px solid var(--text);
		border-radius: 0.5rem;
		padding: 0.5rem;
		font-size: 0.8rem;
		opacity: 0.95;
		min-width: 10rem;
		max-width: 15rem;
		z-index: 1;
	}
</style>
