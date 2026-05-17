<script lang="ts">
	import type { Icon } from 'lucide-svelte'
	import MessageWithLink from '$lib/components/MessageWithLink.svelte'

	interface Props {
		icon: typeof Icon
		content: () => string
	}

	let { icon, content }: Props = $props()

	const SvelteComponent = $derived(icon)
</script>

<div class="icon-bullet" role="listitem">
	<span class="icon">
		<SvelteComponent size="1em" />
	</span>
	<span>
		<MessageWithLink content={content()} />
	</span>
</div>

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
