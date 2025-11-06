<script lang="ts">
	import { onMount } from 'svelte'

	export let defaultToIntersecting = false
	export let disconnectOnIntersect = false
	export let isIntersecting: boolean = defaultToIntersecting
	export let rootMargin: string = '0px'
	export let threshold: number | number[] = 0

	let element: HTMLElement
	let observer: IntersectionObserver

	onMount(() => {
		if (defaultToIntersecting) isIntersecting = false
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
