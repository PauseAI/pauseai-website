<script lang="ts">
	export let title: string
	export let description: string
	export let onClose: () => void
</script>

<dialog
	class="modal"
	open
	aria-labelledby="dialog-title"
	aria-describedby="dialog-description"
	on:click={(e) => {
		if (e.target === e.currentTarget) {
			onClose()
		}
	}}
>
	<div class="modal-content">
		<div class="modal-header">
			<h3 class="modal-title" id="dialog-title">{title}</h3>
			<button class="modal-close" on:click={onClose} autofocus aria-label="Close dialog">×</button>
		</div>
		<p class="modal-description" id="dialog-description">{description}</p>
		<slot />
	</div>
</dialog>

<style>
	.modal {
		position: fixed;
		inset: 0;
		background: transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 50;
		border: none;
		padding: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.modal::backdrop {
		background: rgba(0, 0, 0, 0.5);
		animation: fade-in 0.2s ease-out;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.modal-content {
		background: white;
		border-radius: 0.5rem;
		padding: 1.5rem;
		width: 28rem;
		margin: 1rem;
		animation: fade-in 0.2s ease-out;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		max-height: calc(100vh - 2rem);
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: #cbd5e1 #f1f5f9;
	}

	.modal-content::-webkit-scrollbar {
		width: 8px;
	}

	.modal-content::-webkit-scrollbar-track {
		background: #f1f5f9;
		border-radius: 4px;
	}

	.modal-content::-webkit-scrollbar-thumb {
		background-color: #cbd5e1;
		border-radius: 4px;
	}

	.modal-content::-webkit-scrollbar-thumb:hover {
		background-color: #94a3b8;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
	}

	.modal-title {
		font-size: 1.25rem;
		font-weight: bold;
	}

	.modal-close {
		color: #6b7280;
		cursor: pointer;
	}

	.modal-close:hover {
		color: #374151;
	}

	.modal-description {
		color: #666;
		margin-bottom: 1rem;
	}
</style>
