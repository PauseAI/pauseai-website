<script lang="ts">
	import AdventCard from './AdventCard.svelte'
	import Tooltip from './Tooltip.svelte'
	import { adventCalendar, MAX_SELECTIONS } from '$lib/stores/adventCalendar'
	import type { AdventDay } from '../../../routes/riesgos-ia/+page.server'

	export let days: AdventDay[] = []
	export let baseUrl: string

	$: unlockedCount = days.filter((d) => d.isUnlocked).length
	$: selectedCount = $adventCalendar.selectedDays.length
</script>

<div class="advent-calendar">
	<div class="progress-indicators">
		<div class="progress-item">
			<span class="progress-icon">📅</span>
			<span class="progress-text">
				día <strong>{unlockedCount}</strong> de <strong>{days.length}</strong>
			</span>
		</div>
		<div class="progress-item">
			<span class="progress-icon">🚨</span>
			<span class="progress-text">
				<strong>{selectedCount}</strong> de <strong>{MAX_SELECTIONS}</strong> riesgos prioritarios
			</span>
			<Tooltip
				text="Selecciona hasta 3 riesgos que más te preocupen. Haz clic en el icono de alerta de cada riesgo para marcarlo como prioritario."
				position="top"
			/>
		</div>
	</div>

	<div class="calendar-grid">
		{#each days as day (day.day)}
			<AdventCard {day} {baseUrl} canSelect={true} />
		{/each}
	</div>
</div>

<style>
	.advent-calendar {
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
	}

	.progress-indicators {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-md);
		justify-content: center;
		margin-bottom: var(--spacing-lg);
		padding: var(--spacing-md);
		background: var(--bg-subtle);
		border-radius: 12px;
		border: 2px solid var(--brand);
	}

	.progress-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-family: var(--font-heading);
		font-size: 1.1rem;
	}

	.progress-icon {
		font-size: 1.5rem;
	}

	.progress-text strong {
		color: var(--brand);
		font-size: 1.3rem;
	}

	.calendar-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--spacing-md);
		margin-top: var(--spacing-md);
	}

	@media (max-width: 768px) {
		.advent-calendar {
			padding: 0;
		}

		.calendar-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-sm);
		}

		.progress-indicators {
			flex-direction: column;
			gap: var(--spacing-sm);
		}
	}

	@media (min-width: 769px) and (max-width: 1024px) {
		.calendar-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1025px) {
		.calendar-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
