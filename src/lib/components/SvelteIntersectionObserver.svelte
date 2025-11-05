<script lang="ts">
	import { onMount, onDestroy } from 'svelte'

	export let isIntersecting: boolean = false
	export let rootMargin: string = '0px'
	export let threshold: number | number[] = 0

	let element: HTMLElement
	let observer: IntersectionObserver

	onMount(() => {
		observer = new IntersectionObserver(
			(entries) => {
				isIntersecting = entries[0].isIntersecting
			},
			{ rootMargin, threshold }
		)
		observer.observe(element)
	})

	onDestroy(() => {
		observer.disconnect()
	})
</script>

<div bind:this={element}>
	<slot />
</div>
