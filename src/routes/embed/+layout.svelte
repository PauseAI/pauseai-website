<script lang="ts">
	import { onMount } from 'svelte'
	import { page } from '$app/state'
	import { reportEmbedHeight } from '$lib/embedHeight'

	let wrapper: HTMLDivElement

	onMount(() => {
		if (window.parent === window) return
		// Hosts of the onboarding form set up before the typed message may listen for a bare
		// { height } instead (docs/ONBOARDING_EMBED.md), so it keeps getting both.
		const bareHeightToo = page.route.id === '/embed/onboarding-form'
		// Only measure the wrapper. html/body are height:100% (global styles), so they
		// are always exactly the iframe's size and say nothing about the content.
		// '*' target: the height is not sensitive, and hosts check event.origin.
		return reportEmbedHeight(wrapper, (height) => {
			window.parent.postMessage({ type: 'pauseai-embed-resize', height }, '*')
			if (bareHeightToo) window.parent.postMessage({ height }, '*')
		})
	})
</script>

<svelte:head>
	<!-- Lock light theme before any module JS runs (theme.ts would otherwise re-apply system preference) -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<${'script'}>(function(){var h=document.documentElement;h.setAttribute('color-scheme','light');new MutationObserver(function(){if(h.getAttribute('color-scheme')!=='light')h.setAttribute('color-scheme','light')}).observe(h,{attributes:true,attributeFilter:['color-scheme']})})()</script>`}
</svelte:head>

<!-- The padding keeps a page's margins and shadows inside what is measured: a margin would
     collapse through the wrapper and leave the iframe short. -->
<div class="embed-root" bind:this={wrapper}>
	<slot></slot>
</div>

<style>
	.embed-root {
		padding: 1rem;
	}
</style>
