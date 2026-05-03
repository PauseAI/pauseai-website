<script lang="ts">
	import WideNavlink from './wide/WideNavlink.svelte'
	import NarrowNavlink from './narrow/NarrowNavlink.svelte'

	interface Props {
		href?: string | undefined
		c2a?: boolean
		ariaLabel?: string | undefined
		inverted?: boolean
		first?: boolean
		narrow?: boolean
		active?: boolean
		external?: boolean
		children?: import('svelte').Snippet
	}

	let {
		href = undefined,
		c2a = false,
		ariaLabel = undefined,
		inverted = false,
		first = false,
		narrow = false,
		active = false,
		external = false,
		children
	}: Props = $props()
</script>

<span class="wide-navlink">
	<WideNavlink {href} {c2a} {ariaLabel} {inverted} {first} {narrow} {active} {external}>
		{@render children?.()}
	</WideNavlink>
</span>
<span class="narrow-navlink">
	<NarrowNavlink {href} {c2a} {ariaLabel} {inverted} {first} {narrow} {active} {external}>
		{@render children?.()}
	</NarrowNavlink>
</span>

<style>
	:global(.narrow-navbar) .wide-navlink {
		display: none;
	}

	:global(.wide-navbar) .narrow-navlink {
		display: none;
	}
</style>
