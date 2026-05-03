<script lang="ts">
	interface Props {
		probability?: number
		showLabel?: boolean
	}

	let { probability = 0.5, showLabel = false }: Props = $props()
	const label = (probability: number) => {
		if (probability == 0) return 'impossible'
		if (probability < 0.1) return 'unlikely'
		if (probability < 0.4) return 'maybe'
		if (probability < 0.6) return 'possibly'
		if (probability < 0.9) return 'likely'
		if (probability < 1) return 'probably'
		if (probability == 1) return 'certain'
		return 'very likely'
	}
	let num = $derived(probability * 100)
	let decimals = $derived(num < 1 ? 2 : num < 10 ? 1 : 0)
</script>

{num.toFixed(decimals)}%
{#if showLabel}
	{label(probability)}
{/if}
