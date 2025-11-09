<script lang="ts">
	import { adventCalendar, MAX_SELECTIONS } from '$lib/stores/adventCalendar'
	import type { PageData } from './$types'

	export let data: PageData

	$: isSelected = $adventCalendar.selectedDays.includes(data.day)
	$: selectionCount = $adventCalendar.selectedDays.length
	$: canToggleSelection = isSelected || selectionCount < MAX_SELECTIONS

	function toggleSelection() {
		if (canToggleSelection) {
			adventCalendar.toggleSelection(data.day)
		}
	}
</script>

<svelte:head>
	<title>{data.title} - Riesgos de IA - PauseAI</title>
	<meta name="description" content={data.brief} />
</svelte:head>

<div class="risk-page">
	<header class="risk-header">
		<h1>{data.title}</h1>
	</header>

	<article class="risk-content">
		<svelte:component this={data.content} />
	</article>
</div>

<style>
	.risk-page {
		max-width: 900px;
		margin: 0 auto;
		padding: var(--spacing-lg);
	}

	.risk-header {
		margin-bottom: var(--spacing-xl);
		padding-bottom: var(--spacing-lg);
		border-bottom: 2px solid var(--brand);
		text-align: center;
	}

	h1 {
		font-family: var(--font-heading);
		font-size: 2.5rem;
		color: var(--brand);
		margin: 0;
		line-height: 1.2;
	}

	.risk-content {
		font-size: 1.1rem;
		line-height: 1.8;
		margin-bottom: var(--spacing-xl);
	}

	.risk-content :global(h1),
	.risk-content :global(h2),
	.risk-content :global(h3) {
		font-family: var(--font-heading);
		color: var(--text);
		margin-top: var(--spacing-xl);
		margin-bottom: var(--spacing-md);
	}

	.risk-content :global(h1) {
		font-size: 2rem;
		color: var(--brand);
	}

	.risk-content :global(h2) {
		font-size: 1.6rem;
	}

	.risk-content :global(h3) {
		font-size: 1.3rem;
	}

	.risk-content :global(p) {
		margin: var(--spacing-md) 0;
	}

	.risk-content :global(ul),
	.risk-content :global(ol) {
		margin: var(--spacing-md) 0;
		padding-left: var(--spacing-xl);
	}

	.risk-content :global(li) {
		margin: var(--spacing-sm) 0;
	}

	@media (max-width: 768px) {
		.risk-page {
			padding: var(--spacing-md);
		}

		h1 {
			font-size: 2rem;
		}

		.risk-content {
			font-size: 1rem;
		}

		.risk-content :global(h1) {
			font-size: 1.6rem;
		}

		.risk-content :global(h2) {
			font-size: 1.4rem;
		}
	}
</style>
