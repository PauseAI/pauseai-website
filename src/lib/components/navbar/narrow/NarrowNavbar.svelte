<script lang="ts">
	import UniversalNavbar from '../universal/UniversalNavbar.svelte'
	interface Props {
		children?: import('svelte').Snippet
		[key: string]: unknown
	}

	let { children, ...rest }: Props = $props()
</script>

<UniversalNavbar {...rest}>
	{@render children?.()}
</UniversalNavbar>
