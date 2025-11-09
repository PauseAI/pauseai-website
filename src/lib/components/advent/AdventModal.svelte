<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { onDestroy } from 'svelte'
	import { browser } from '$app/environment'
	import type { AdventDay } from '../../../routes/riesgos-ia/+page.server'
	import { adventCalendar, MAX_SELECTIONS } from '$lib/stores/adventCalendar'

	export let day: AdventDay | null
	export let baseUrl: string

	$: isSelected = day ? $adventCalendar.selectedDays.includes(day.day) : false
	$: selectionCount = $adventCalendar.selectedDays.length
	$: canToggleSelection = day ? isSelected || selectionCount < MAX_SELECTIONS : false

	// Prevent body scrolling when modal is open
	$: if (browser) {
		if (day) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}
	}

	onDestroy(() => {
		if (browser) {
			document.body.style.overflow = ''
		}
	})

	function close() {
		// Preserve existing query parameters (like test_date) when closing
		const params = new URLSearchParams($page.url.searchParams)
		params.delete('dia')
		const queryString = params.toString()
		const url = queryString ? `${baseUrl}?${queryString}` : baseUrl
		goto(url, { replaceState: true })
	}

	function toggleSelection(e: Event) {
		e.stopPropagation()
		if (day && day.isUnlocked && canToggleSelection) {
			adventCalendar.toggleSelection(day.day)
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			close()
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			close()
		}
	}
</script>

{#if day}
	<div
		class="modal-backdrop"
		on:click={handleBackdropClick}
		on:keydown={handleKeydown}
		role="button"
		tabindex="-1"
	>
		<div class="modal-content" role="dialog" aria-modal="true">
			<div class="modal-header">
				<div class="header-left">
					<span class="day-number">Día {day.day}</span>
					<h2 class="modal-title">{day.title}</h2>
				</div>
				<div class="header-right">
					{#if day.isUnlocked}
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
					<button class="close-btn" on:click={close} aria-label="Cerrar">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M18 6L6 18M6 6l12 12" />
						</svg>
					</button>
				</div>
			</div>

			<div class="modal-body">
				{#if day.content}
					{@html day.content}
				{:else if day.brief}
					<p>{day.brief}</p>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.75);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--spacing-md);
		animation: fadeIn 0.2s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.modal-content {
		background: var(--bg);
		border-radius: 12px;
		max-width: 800px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		border: 2px solid var(--brand);
		animation: slideUp 0.3s ease;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
	}

	@keyframes slideUp {
		from {
			transform: translateY(20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: var(--spacing-lg);
		border-bottom: 2px solid var(--brand-subtle);
		position: sticky;
		top: 0;
		background: var(--bg);
		z-index: 1;
	}

	.header-left {
		flex: 1;
		min-width: 0;
	}

	.header-right {
		display: flex;
		gap: var(--spacing-sm);
		align-items: center;
		margin-left: var(--spacing-md);
	}

	.day-number {
		font-family: var(--font-heading);
		font-size: 1rem;
		color: var(--brand);
		font-weight: 600;
		display: block;
		margin-bottom: var(--spacing-xs);
	}

	.modal-title {
		font-family: var(--font-heading);
		font-size: 2rem;
		margin: 0;
		color: var(--text);
		word-wrap: break-word;
	}

	.priority-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.priority-btn:hover:not(.disabled) {
		transform: scale(1.2);
	}

	.priority-btn.disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.priority-btn .icon {
		font-size: 1.8rem;
		display: block;
		transition: all 0.2s ease;
	}

	.priority-btn .icon.inactive {
		filter: grayscale(100%) opacity(0.4);
	}

	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px;
		width: 36px;
		height: 36px;
		color: var(--text);
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.close-btn:hover {
		color: var(--brand);
		transform: scale(1.1);
	}

	.close-btn svg {
		width: 100%;
		height: 100%;
	}

	.modal-body {
		padding: var(--spacing-lg);
		font-size: 1.1rem;
		line-height: 1.8;
	}

	.modal-body :global(h1),
	.modal-body :global(h2),
	.modal-body :global(h3) {
		font-family: var(--font-heading);
		color: var(--text);
		margin-top: var(--spacing-lg);
		margin-bottom: var(--spacing-sm);
	}

	.modal-body :global(h1) {
		font-size: 2rem;
		color: var(--brand);
	}

	.modal-body :global(h2) {
		font-size: 1.5rem;
	}

	.modal-body :global(h3) {
		font-size: 1.2rem;
	}

	.modal-body :global(p) {
		margin: var(--spacing-sm) 0;
	}

	.modal-body :global(ul),
	.modal-body :global(ol) {
		margin: var(--spacing-sm) 0;
		padding-left: var(--spacing-lg);
	}

	.modal-body :global(li) {
		margin: var(--spacing-xs) 0;
	}

	@media (max-width: 768px) {
		.modal-backdrop {
			padding: 0;
			align-items: stretch;
		}

		.modal-content {
			max-height: 100vh;
			border-radius: 0;
			height: 100%;
		}

		.modal-header {
			padding: var(--spacing-md);
			flex-wrap: wrap;
		}

		.header-left {
			flex-basis: 100%;
			margin-bottom: var(--spacing-sm);
		}

		.header-right {
			margin-left: 0;
		}

		.modal-title {
			font-size: 1.5rem;
		}

		.modal-body {
			padding: var(--spacing-md);
			font-size: 1rem;
		}

		.modal-body :global(h1) {
			font-size: 1.5rem;
		}

		.modal-body :global(h2) {
			font-size: 1.3rem;
		}
	}
</style>
