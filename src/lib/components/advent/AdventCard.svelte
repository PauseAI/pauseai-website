<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { adventCalendar, MAX_SELECTIONS } from '$lib/stores/adventCalendar'
	import type { AdventDay } from '../../../routes/riesgos-ia/+page.server'

	export let day: AdventDay
	export let canSelect: boolean
	export let baseUrl: string

	$: isSelected = $adventCalendar.selectedDays.includes(day.day)
	$: selectionCount = $adventCalendar.selectedDays.length
	$: canToggleSelection = isSelected || selectionCount < MAX_SELECTIONS

	function openModal() {
		if (day.isUnlocked && day.content) {
			// Preserve existing query parameters (like test_date)
			const params = new URLSearchParams($page.url.searchParams)
			params.set('dia', day.day.toString())
			goto(`${baseUrl}?${params.toString()}`, { replaceState: false })
		}
	}

	function toggleSelection(e: Event) {
		e.stopPropagation()
		if (day.isUnlocked && canToggleSelection) {
			adventCalendar.toggleSelection(day.day)
		}
	}

	function formatDate(date: Date): string {
		const d = new Date(date)
		return d.toLocaleDateString('es-ES', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		})
	}
</script>

<div
	class="advent-card"
	class:locked={!day.isUnlocked}
	class:unlocked={day.isUnlocked}
	class:selected={isSelected}
	on:click={openModal}
	on:keydown={(e) => e.key === 'Enter' && openModal()}
	role="button"
	tabindex={day.isUnlocked ? 0 : -1}
	aria-label={day.isUnlocked ? `${day.title}` : `Bloqueado hasta ${formatDate(day.unlockDate)}`}
>
	<div class="card-header">
		<span class="day-number">Día {day.day}</span>
		{#if day.isUnlocked && canSelect}
			<button
				class="priority-btn"
				class:active={isSelected}
				class:disabled={!canToggleSelection}
				on:click={toggleSelection}
				disabled={!canToggleSelection}
				aria-label={isSelected ? 'Quitar de riesgos prioritarios' : 'Marcar como prioritario'}
				title={isSelected ? 'Quitar de riesgos prioritarios' : 'Marcar como prioritario'}
			>
				<span class="icon" class:inactive={!isSelected}>🚨</span>
			</button>
		{/if}
	</div>

	<div class="card-content">
		{#if day.isUnlocked}
			<h3 class="card-title">{day.title}</h3>
			{#if day.brief}
				<p class="card-brief">{day.brief}</p>
			{/if}

			{#if day.content}
				<div class="expand-hint">▼ Haz clic para ver más</div>
			{/if}
		{:else}
			<div class="locked-content">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					class="lock-icon"
				>
					<rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
					<path d="M7 11V7a5 5 0 0110 0v4" />
				</svg>
				<p class="unlock-date">Disponible el {formatDate(day.unlockDate)}</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.advent-card {
		border: 2px solid var(--brand);
		border-radius: 8px;
		padding: var(--spacing-sm);
		background: var(--bg);
		transition: all 0.3s ease;
		cursor: pointer;
		min-height: 150px;
		display: flex;
		flex-direction: column;
	}

	.advent-card.unlocked:hover {
		box-shadow: 0 4px 12px rgba(255, 148, 22, 0.3);
		transform: translateY(-2px);
	}

	.advent-card.locked {
		opacity: 0.5;
		filter: grayscale(50%);
		cursor: not-allowed;
		border-color: var(--text-subtle);
	}

	.advent-card.selected {
		border-width: 3px;
		box-shadow: 0 0 0 2px var(--brand);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-xs);
	}

	.day-number {
		font-family: var(--font-heading);
		font-size: 1.2rem;
		color: var(--brand);
		font-weight: 600;
	}

	.priority-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px;
		transition: all 0.2s ease;
	}

	.priority-btn:hover:not(.disabled) {
		transform: scale(1.2);
	}

	.priority-btn.disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.priority-btn .icon {
		font-size: 1.5rem;
		display: block;
		transition: all 0.2s ease;
	}

	.priority-btn .icon.inactive {
		filter: grayscale(100%) opacity(0.4);
	}

	.card-content {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.card-title {
		font-family: var(--font-heading);
		font-size: 1.4rem;
		margin: 0 0 var(--spacing-xs) 0;
		color: var(--text);
	}

	.card-brief {
		margin: 0 0 var(--spacing-xs) 0;
		color: var(--text);
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.expand-hint {
		text-align: center;
		font-size: 0.8rem;
		color: var(--brand);
		margin-top: auto;
		padding-top: var(--spacing-xs);
		font-family: var(--font-heading);
	}

	.locked-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex: 1;
		gap: var(--spacing-sm);
		padding: var(--spacing-md) 0;
	}

	.lock-icon {
		width: 48px;
		height: 48px;
		color: var(--text-subtle);
	}

	.unlock-date {
		text-align: center;
		color: var(--text);
		font-size: 0.9rem;
		margin: 0;
	}
</style>
