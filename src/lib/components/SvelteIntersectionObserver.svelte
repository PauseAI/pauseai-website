<script lang="ts">
	import { onMount } from 'svelte'

	interface Props {
		defaultToIntersecting?: boolean
		disconnectOnIntersect?: boolean
		isIntersecting?: boolean
		rootMargin?: string
		threshold?: number | number[]
		children?: import('svelte').Snippet
	}

	let {
		defaultToIntersecting = false,
		disconnectOnIntersect = false,
		isIntersecting = $bindable(defaultToIntersecting),
		rootMargin = '0px',
		threshold = 0,
		children
	}: Props = $props()

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
	{@render children?.()}
</div>
