<script lang="ts">
	import { type Component } from 'svelte'
	import AsyncComponent from '$lib/components/AsyncComponent.svelte'
	import SvelteIntersectionObserver from '$lib/components/SvelteIntersectionObserver.svelte'
	import Link from '$lib/components/Link.svelte'

	let numberFlowPromise = import('@number-flow/svelte').then(
		(m) => m.default as unknown as Component
	)

	interface Props {
		percentage: number
		text: string
		link: string
	}

	let { percentage, text, link }: Props = $props()

	let isIntersecting: boolean = $state(false)
</script>

<SvelteIntersectionObserver bind:isIntersecting defaultToIntersecting disconnectOnIntersect>
	<Link href={link} class="stat-block-link">
		<div class="percentage">
			<AsyncComponent
				component={numberFlowPromise}
				props={{ value: isIntersecting ? percentage : 20, suffix: '%' }}
			>
				{percentage}%
			</AsyncComponent>
			<!-- start with two digits and wide first digit to avoid horizontal movement -->
		</div>
		<p class="text">{text}</p>
	</Link>
</SvelteIntersectionObserver>

<style>
	:global(.stat-block-link) {
		display: flex;
		align-items: center;
		gap: 1rem;
		text-decoration: none;
		color: inherit;
		opacity: 0.9;
		transition: opacity 0.2s ease;
	}

	:global(.stat-block-link:hover) {
		opacity: 1;
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

	.text {
		line-height: 1.4;
		margin: 0;
	}
</style>
