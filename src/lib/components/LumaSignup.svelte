<script lang="ts">
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'

	const BASE_URL = 'https://lu.ma'
	const EMBED_BASE_URL = 'https://embed.lu.ma'

	interface Props {
		eventId: string
		children?: import('svelte').Snippet
	}

	let { eventId, children }: Props = $props()
</script>

<svelte:head>
	<script id="luma-checkout" src="{EMBED_BASE_URL}/checkout-button.js"></script>
</svelte:head>

<div>
	<LinkWithoutIcon
		href={BASE_URL + '/event/' + eventId}
		class="luma-checkout--button"
		data-luma-action="checkout"
		data-luma-event-id={eventId}
	>
		{@render children?.()}
	</LinkWithoutIcon>
</div>

<style>
	div {
		display: flex;
		justify-content: center;
	}
</style>
