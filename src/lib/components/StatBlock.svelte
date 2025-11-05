<script lang="ts">
	import NumberFlow from '@number-flow/svelte'
	import IntersectionObserver from '$lib/components/IntersectionObserver.svelte'
	import { onMount } from 'svelte'

	export let percentage: number
	export let text: string
	export let link: string

	// prerender correct number
	let isIntersecting = true
	onMount(() => {
		isIntersecting = false
	})
</script>

<IntersectionObserver bind:isIntersecting>
	<div class="stat-block">
		<div class="percentage">
			<a href={link} class="number">
				<NumberFlow value={isIntersecting ? percentage : 10} />% <!-- start with two digits -->
			</a>
		</div>
		<p class="text">{text}</p>
	</div>
</IntersectionObserver>

<style>
	.stat-block {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.percentage {
		font-size: clamp(2rem, 7vw, 3rem);
		font-weight: bold;
		font-family: var(--font-heading);
		color: var(--brand);
		display: flex;
		align-items: center;
		line-height: 1em;
	}

	a {
		color: var(--brand);
		text-decoration: none;
	}

	a.number {
		position: relative;
	}

	a.number:hover::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: 0.8rem;
		width: 100%;
		height: 3px;
		background-color: currentColor;
	}

	.text {
		line-height: 1.4;
		margin: 0;
		opacity: 0.9;
	}
</style>
