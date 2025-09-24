<script lang="ts">
	import Link from '$lib/components/Link.svelte'

	export let href: string
	export let target: string | null = null
	let className: string = ''
	export { className as class }
	export let rel: string | null = null
</script>

<Link {href} {target} {rel} class={className}>
	<slot />
</Link>
