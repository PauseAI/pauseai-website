<script lang="ts">
	import { onMount } from 'svelte'

	export let isIntersecting: boolean = false
	export let rootMargin: string = '0px'
	export let threshold: number | number[] = 0
	export let disconnectOnIntersect = false

	let element: HTMLElement
	let observer: IntersectionObserver

	onMount(() => {
		observer = new IntersectionObserver(
			(entries) => {
				isIntersecting = entries[0].isIntersecting
				if (disconnectOnIntersect && isIntersecting) observer.disconnect()
			},
			{ rootMargin, threshold }
		)
		observer.observe(element)
		return () => observer.disconnect()
	})
</script>

<div bind:this={element}>
	<slot />
</div>
