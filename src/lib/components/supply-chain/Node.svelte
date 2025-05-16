<script lang="ts">
	import { categoryColors } from './data'
	export let label: string
	export let category: keyof typeof categoryColors
	export let x: number
	export let y: number
	export let onClick: () => void
</script>

<div
	class="node {categoryColors[category]}"
	style="left: {x}px; top: {y}px; position: absolute; transform: translate(-50%, -50%);"
	on:click={onClick}
	on:keydown={(event) => {
		if (event.key === 'Enter' || event.key === ' ') {
			onClick()
		}
	}}
	role="button"
	tabindex="0"
>
	<span class="node-label">{label}</span>
</div>

<style>
	.node {
		position: absolute;
		cursor: pointer;
		border-radius: 0.5rem;
		padding: 0.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: all 0.2s ease;
		width: 100px;
		text-align: center;
		z-index: 2;
		margin: 0;
	}

	.node:hover {
		transform: scale(1.05);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
	}

	.node-label {
		font-size: 0.75rem;
		font-weight: 500;
	}

	.node-equipment {
		background-color: #e0e7ff;
		border: 2px solid #6366f1;
	}

	.node-equipment:hover {
		background-color: #c7d2fe;
		border-color: #4338ca;
	}

	.node-foundry {
		background-color: #fed7aa;
		border: 2px solid #fb923c;
	}

	.node-foundry:hover {
		background-color: #fdba74;
		border-color: #ea580c;
	}

	.node-design {
		background-color: #fee2e2;
		border: 2px solid #fca5a5;
	}

	.node-design:hover {
		background-color: #fecaca;
		border-color: #ef4444;
	}

	.node-eda {
		background-color: #f0fdf4;
		border: 2px solid #34d399;
	}

	.node-eda:hover {
		background-color: #bbf7d0;
		border-color: #059669;
	}

	.node-memory {
		background-color: #fef9c3;
		border: 2px solid #fde047;
	}

	.node-memory:hover {
		background-color: #fef08a;
		border-color: #ca8a04;
	}

	.node-assembly {
		background-color: #dbeafe;
		border: 2px solid #93c5fd;
	}

	.node-assembly:hover {
		background-color: #bfdbfe;
		border-color: #3b82f6;
	}

	.node-end {
		background-color: #f3e8ff;
		border: 2px solid #d8b4fe;
	}

	.node-end:hover {
		background-color: #e9d5ff;
		border-color: #a855f7;
	}
</style>
