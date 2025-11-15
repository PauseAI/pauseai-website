<script lang="ts">
	import UniversalNavlink from '../universal/UniversalNavlink.svelte'

	export let href: string | undefined
	export let c2a: boolean
	export let ariaLabel: string | undefined
	export let inverted: boolean
	export let first: boolean
	export let narrow: boolean
	export let active: boolean
	export let external: boolean
</script>

<UniversalNavlink {href} {c2a} {ariaLabel} {inverted} {first} {narrow} {active} {external}>
	<slot />
</UniversalNavlink>
