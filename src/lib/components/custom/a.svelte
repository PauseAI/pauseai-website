<script lang="ts">
	import LinkWithIcon from '$lib/components/LinkWithIcon.svelte'

	export let href: string
	export let target: string | null = null
	let className: string = ''
	export { className as class }
	export let hideIcon = false
	export let rel: string | null = null
</script>

<LinkWithIcon {href} {target} {rel} class={className} {hideIcon}>
	<slot />
</LinkWithIcon>
