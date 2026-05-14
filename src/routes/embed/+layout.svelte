<script lang="ts">
	import { onMount } from 'svelte'

	let wrapper: HTMLDivElement

	onMount(() => {
		if (window.parent === window) return

		const post = () => {
			// Only measure the wrapper. html/body are height:100% (global styles)
			// so their scrollHeight is pinned to the iframe's current size and won't
			// shrink when content collapses. Ceil the subpixel rect height — if the
			// real height is 234.4px, offsetHeight reports 234 and the parent's
			// iframe.style.height=234 leaves 0.4px overflowing, showing a scrollbar.
			const height = Math.ceil(wrapper.getBoundingClientRect().height)
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
