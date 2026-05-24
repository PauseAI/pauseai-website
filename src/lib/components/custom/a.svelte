<script lang="ts">
	import Link from '$lib/components/Link.svelte'

	interface Props {
		href: string
		target?: string | null
		class?: string
		rel?: string | null
		children?: import('svelte').Snippet
	}

	let { href, target = null, class: className = '', rel = null, children }: Props = $props()
</script>

<Link {href} {target} {rel} class={className}>
	{@render children?.()}
</Link>
