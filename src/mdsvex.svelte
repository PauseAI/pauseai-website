<script module lang="ts">
	// eslint-disable-next-line no-restricted-imports -- reserved for mdsvex
	import { img as MdsvexImg, a as MdsvexA, table as MdsvexTable } from '$lib/components/custom'

	export const img = MdsvexImg
	export const a = MdsvexA
	export const table = MdsvexTable
</script>

<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet
	}

	let { children }: Props = $props()
</script>

{@render children?.()}
