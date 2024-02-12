<script lang="ts">
	import { onMount } from 'svelte'
	import ExternalLink from 'lucide-svelte/icons/external-link'

	export let href: string
	export let target: string | null = null

	let isExternal = false

	onMount(() => {
		isExternal = href.startsWith('http:') || href.startsWith('https:') || href.startsWith('mailto:')
	})
</script>

<a {href} {target}>
	<slot />{#if isExternal}
		<span style="white-space: nowrap">
			<div class="icon">
				<ExternalLink size="0.8em" />
			</div>
		</span>
	{/if}
</a>

<style>
	.icon {
		display: inline-block;
		vertical-align: text-top;
		margin-left: 0.1em;
	}
</style>
