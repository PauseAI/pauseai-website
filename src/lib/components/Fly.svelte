<script lang="ts">
	/*!
	 * Derived from a component by Pause IA, licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/): https://github.com/Pause-IA/pauseai-france/blob/f447521f0835b004f76b60d2c9fc15123f967b50/src/lib/components/Fly.svelte
	 */

	import { onMount } from 'svelte'
	import {
		inview,
		type ObserverEventDetails,
		type Options,
		type ScrollDirection
	} from 'svelte-inview'
	import { fly, type FlyParams } from 'svelte/transition'

	let scrollDirection: ScrollDirection
	let isInView = true // visible during prerendering
	onMount(() => (isInView = false))

	export let offsetPercentage = 0.1
	export let flyParams: FlyParams = { y: 60, x: 0, duration: 500 }
	export let useDirection = true

	const options: Options = {
		unobserveOnEnter: true,
		rootMargin: `${-offsetPercentage * 100}%`
	}

	const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => {
		isInView = detail.inView
		scrollDirection = detail.scrollDirection
	}

	function getFlyParams() {
		if (!useDirection || !scrollDirection) return flyParams
		const { x = 0, y = 0 } = flyParams
		const { vertical, horizontal } = scrollDirection

		if (vertical) return { ...flyParams, y: vertical === 'down' ? -y : y }
		if (horizontal) return { ...flyParams, x: horizontal === 'right' ? -x : x }
		return flyParams
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
