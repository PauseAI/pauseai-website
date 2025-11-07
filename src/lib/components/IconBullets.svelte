<script lang="ts">
	import type { Icon } from 'lucide-svelte'
	import MessageWithLink from '$lib/components/MessageWithLink.svelte'

	export let items: [typeof Icon, () => string][]
</script>

{#each items as item}
	<div class="icon-bullet" role="listitem">
		<span class="icon">
			<svelte:component this={item[0]} size="1em" />
		</span>
		<span>
			<MessageWithLink content={item[1]()} />
		</span>
	</div>
{/each}

<style>
	.icon-bullet {
		display: flex;
		gap: 0.5em;
		margin-bottom: 0.4em;
	}

	.icon {
		margin-top: 0.2em;
	}
</style>
