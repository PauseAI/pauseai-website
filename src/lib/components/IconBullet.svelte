<script lang="ts">
	import type { Icon } from 'lucide-svelte'

	export let icon: typeof Icon
</script>

<div class="icon-bullet" role="listitem">
	<span class="icon">
		<svelte:component this={icon} size="1em" />
	</span>
	<slot />
</div>

<style>
	.icon-bullet {
		margin-bottom: 0.4em;
	}

	.icon {
		display: inline-block;
		margin-right: 0.5em;
	}
</style>
