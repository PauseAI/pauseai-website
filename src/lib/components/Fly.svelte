<script lang="ts">
	import {
		inview,
		type ObserverEventDetails,
		type Options,
		type ScrollDirection
	} from 'svelte-inview'
	import { fly, type FlyParams } from 'svelte/transition'

	let scrollDirection: ScrollDirection
	let isInView = false

	export let offsetPercentage = 0.1
	export let flyParams: FlyParams = {
		y: 60,
		x: 0,
		duration: 500
	}
	export let useDirection = true

	const options: Options = {
		unobserveOnEnter: true,
		rootMargin: `${(offsetPercentage * -100).toString()}%`
	}
	const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => {
		isInView = detail.inView
		scrollDirection = detail.scrollDirection
	}

	function getFlyParams() {
		const definedY = flyParams.y ?? 0
		const definedX = flyParams.x ?? 0
		if (useDirection) {
			if (scrollDirection.vertical === 'down') {
				return {
					...flyParams,
					y: -definedY
				}
			} else if (scrollDirection.vertical === 'up') {
				return {
					...flyParams,
					y: definedY
				}
			} else if (scrollDirection.horizontal === 'right') {
				return {
					...flyParams,
					x: -definedX
				}
			} else if (scrollDirection.horizontal === 'left') {
				return {
					...flyParams,
					x: definedX
				}
			}
		} else {
			return flyParams
		}
	}
</script>

{#key isInView}
	<div
		use:inview={options}
		on:inview_enter={handleChange}
		in:fly={getFlyParams()}
		class:inView={isInView}
	>
		<slot />
	</div>
{/key}

<style>
	div {
		opacity: 0;
	}
	.inView {
		opacity: unset;
	}
</style>
