<script lang="ts">
	import { clsx } from 'clsx'

	type Variant = 'text' | 'rect' | 'circle'
	type Animation = 'shimmer' | 'pulse' | 'none'

	let className = ''
	export { className as class }
	export let width: string = '100%'
	export let height: string = '1em'
	export let variant: Variant = 'text'
	export let animation: Animation = 'shimmer'
	export let count: number = 1
	export let loading: boolean = true

	function isLastLineOfMultilineText(variant: Variant, index: number, totalCount: number) {
		return variant === 'text' && index === totalCount - 1 && totalCount > 1
	}
</script>

{#if loading}
	{#each Array.from({ length: count }) as _, i}
		<span
			class={clsx('skeleton', variant, animation, className)}
			style:width={isLastLineOfMultilineText(variant, i, count) ? `calc(0.8 * ${width})` : width}
			style:height
		></span>
	{/each}
{:else}
	<slot></slot>
{/if}

<style>
	.skeleton {
		display: inline-block;
		position: relative;
		overflow: hidden;
		background-color: rgba(255, 255, 255, 0.15);
	}

	:global([color-scheme='light']) .skeleton {
		background-color: rgba(0, 0, 0, 0.1);
	}

	.text {
		border-radius: 4px;
	}

	.circle {
		border-radius: 50%;
		aspect-ratio: 1 / 1;
		height: auto;
	}

	/* Animations */
	.shimmer::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.1) 50%,
			transparent 100%
		);
		animation: shimmer 1.5s infinite;
	}

	:global([color-scheme='light']) .shimmer::after {
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.5) 50%,
			transparent 100%
		);
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	.pulse {
		animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.4;
		}
	}
</style>
