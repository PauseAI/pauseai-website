<script lang="ts">
	import { browser } from '$app/environment'
	import { onMount } from 'svelte'
	import * as m from '../../paraglide/messages'
	import Node from './Node.svelte'

	let heading: HTMLHeadingElement
	let headingsBelow: Element[] | undefined

	onMount(() => {
		const parent = heading.parentElement
		const siblings = parent?.children
		if (!siblings) return
		const siblingsArray = Array.from(siblings)
		const index = siblingsArray.indexOf(heading)
		const siblingsBelow = siblingsArray.slice(index + 1)
		headingsBelow = siblingsBelow.filter((sibling) => sibling.tagName.startsWith('H'))
	})
</script>

{#if browser}
	<h2 bind:this={heading}>{m.simpletoc_heading()}</h2>
	{#if headingsBelow}
		<Node headings={headingsBelow} />
	{/if}
{/if}
