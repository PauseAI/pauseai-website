<script lang="ts">
	import NumberFlow from '@number-flow/svelte'
	import SvelteIntersectionObserver from '$lib/components/SvelteIntersectionObserver.svelte'
	import Link from '$lib/components/Link.svelte'

	export let percentage: number
	export let text: string
	export let link: string

	let isIntersecting: boolean
</script>

<SvelteIntersectionObserver bind:isIntersecting defaultToIntersecting disconnectOnIntersect>
	<div class="stat-block">
		<div class="percentage">
			<Link href={link} class="number-link">
				<NumberFlow value={isIntersecting ? percentage : 20} suffix="%" />
				<!-- start with two digits and wide first digit to avoid horizontal movement -->
			</Link>
		</div>
		<p class="text">{text}</p>
	</div>
</SvelteIntersectionObserver>

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

	* :global(.number-link) {
		color: var(--brand);
		text-decoration: none;
	}

	* :global(.number-link) {
		position: relative;
	}

	* :global(.number-link):hover::after {
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
