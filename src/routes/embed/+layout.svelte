<script lang="ts">
	import { onMount } from 'svelte'
	import { reportEmbedHeight } from '$lib/embedHeight'

	let wrapper: HTMLDivElement

	onMount(() => {
		if (window.parent === window) return
		// Only measure the wrapper. html/body are height:100% (global styles), so they
		// are always exactly the iframe's size and say nothing about the content.
		return reportEmbedHeight(wrapper, (height) =>
			window.parent.postMessage({ type: 'pauseai-embed-resize', height }, '*')
		)
	})
</script>

<svelte:head>
	<!-- Lock light theme before any module JS runs (theme.ts would otherwise re-apply system preference) -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<${'script'}>(function(){var h=document.documentElement;h.setAttribute('color-scheme','light');new MutationObserver(function(){if(h.getAttribute('color-scheme')!=='light')h.setAttribute('color-scheme','light')}).observe(h,{attributes:true,attributeFilter:['color-scheme']})})()</script>`}
</svelte:head>

<div bind:this={wrapper}>
	<slot></slot>
</div>
