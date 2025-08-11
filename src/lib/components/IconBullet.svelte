<script lang="ts">
	import type { Icon } from 'lucide-svelte'

	export let icon: typeof Icon
</script>

<div class="icon-bullet" role="listitem">
	<span class="icon">
		<svelte:component this={icon} size="1em" />
	</span>
	<span>
		<slot />
	</span>
</div>

<style>
	.icon-bullet {
		display: flex;
		gap: 0.5em;
		margin-bottom: 0.4em;
	}
</style>
