<script lang="ts">
	import { onMount } from 'svelte'

	let wrapper: HTMLDivElement

	onMount(() => {
		if (window.parent === window) return

		const post = () => {
			const height = Math.max(
				wrapper.scrollHeight,
				wrapper.offsetHeight,
				document.body.scrollHeight,
				document.documentElement.scrollHeight
			)
			window.parent.postMessage({ type: 'pauseai-embed-resize', height }, '*')
		}

		const observer = new ResizeObserver(post)
		observer.observe(wrapper)
		post()

		return () => observer.disconnect()
	})
</script>

<svelte:head>
	<!-- Lock light theme before any module JS runs (theme.ts would otherwise re-apply system preference) -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<${'script'}>(function(){var h=document.documentElement;h.setAttribute('color-scheme','light');new MutationObserver(function(){if(h.getAttribute('color-scheme')!=='light')h.setAttribute('color-scheme','light')}).observe(h,{attributes:true,attributeFilter:['color-scheme']})})()</script>`}
</svelte:head>

<div bind:this={wrapper}>
	<slot />
</div>
