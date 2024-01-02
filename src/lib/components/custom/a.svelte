<script lang="ts">
	import { onMount } from 'svelte'
	import { ExternalLink } from 'lucide-svelte'

	export let href: string
	let isExternal = false

	onMount(() => {
		isExternal = href.startsWith('http') || href.startsWith('https')
	})
</script>

<a {href}>
	<slot />{#if isExternal}
		<div class="icon">
			<ExternalLink />
		</div>
	{/if}
</a>

<style>
	.icon {
		display: inline-block;
		vertical-align: middle;
		transform: scale(0.8);
	}
</style>
