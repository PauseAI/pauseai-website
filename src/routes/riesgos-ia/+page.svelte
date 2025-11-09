<script lang="ts">
	import { page } from '$app/stores'
	import AdventCalendar from '$lib/components/advent/AdventCalendar.svelte'
	import AdventModal from '$lib/components/advent/AdventModal.svelte'
	import type { PageData } from './$types'

	export let data: PageData

	const baseUrl = '/riesgos-ia'

	$: selectedDayParam = $page.url.searchParams.get('dia')
	$: selectedDayNumber = selectedDayParam ? parseInt(selectedDayParam, 10) : null
	$: selectedDay = selectedDayNumber
		? data.adventDays.find((d) => d.day === selectedDayNumber && d.isUnlocked) || null
		: null
</script>

<svelte:head>
	<title>Riesgos de IA - PauseAI</title>
	<meta
		name="description"
		content="Descubre los 27 riesgos de la Inteligencia Artificial. Cada día se desbloquea un nuevo riesgo desde el 30 de noviembre hasta el 26 de diciembre de 2025."
	/>
</svelte:head>

<div class="page-container">
	<header class="page-header">
		<h1>Riesgos de IA</h1>
		<p class="subtitle">
			Descubre un nuevo riesgo de la Inteligencia Artificial cada día desde el 30 de noviembre hasta
			el 26 de diciembre de 2025.
		</p>
	</header>

	<AdventCalendar days={data.adventDays} {baseUrl} />
</div>

<AdventModal day={selectedDay} {baseUrl} />

<style>
	.page-container {
		max-width: 1400px;
		margin: 0 auto;
		padding: var(--spacing-md);
	}

	.page-header {
		text-align: center;
		padding: var(--spacing-md) var(--spacing-md);
	}

	.page-header p {
		margin-bottom: 0;
	}

	h1 {
		font-family: var(--font-heading);
		font-size: 3rem;
		color: var(--brand);
		margin: 0 0 var(--spacing-sm) 0;
		text-transform: uppercase;
	}

	.subtitle {
		font-size: 1.2rem;
		color: var(--text);
		margin: 0 0 var(--spacing-md) 0;
		max-width: 800px;
		margin-left: auto;
		margin-right: auto;
		line-height: 1.6;
	}

	@media (max-width: 768px) {
		.page-container {
			padding: var(--spacing-sm);
		}

		.page-header {
			padding: var(--spacing-md) var(--spacing-sm);
		}

		h1 {
			font-size: 2rem;
		}

		.subtitle {
			font-size: 1rem;
		}
	}
</style>
