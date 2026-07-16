<script lang="ts">
	import UniversalNavlink from '../universal/UniversalNavlink.svelte'

	interface Props {
		href: string | undefined
		c2a: boolean
		ariaLabel: string | undefined
		inverted: boolean
		first: boolean
		narrow: boolean
		active: boolean
		external: boolean
		children?: import('svelte').Snippet
	}

	let { href, c2a, ariaLabel, inverted, first, narrow, active, external, children }: Props =
		$props()
</script>

<UniversalNavlink {href} {c2a} {ariaLabel} {inverted} {first} {narrow} {active} {external}>
	{@render children?.()}
</UniversalNavlink>
