<script lang="ts">
	import { onMount } from 'svelte'
	import { ExternalLink } from 'lucide-svelte'

	export let href: string
	export let target: string | null = null

	const RELATIVE_ICON_SIZE = 0.8

	let isExternal = false
	let anchor: HTMLAnchorElement
	let iconSize: number;

	onMount(() => {
		iconSize = parseFloat(getComputedStyle(anchor).fontSize) * RELATIVE_ICON_SIZE
		isExternal = href.startsWith('http:') || href.startsWith('https:') || href.startsWith('mailto:')
	})
</script>

<a bind:this={anchor} {href} {target}>
	<slot />{#if isExternal}
		<span style='white-space: nowrap'>
			<div class="icon">
				<ExternalLink size={iconSize} />
			</div>
		</span>
	{/if}
</a>

<style>
	.icon {
		display: inline-block;
		vertical-align: middle;
		margin-left: 0.1em;
	}
</style>
