<script lang="ts">
	import WideNavlink from './wide/WideNavlink.svelte'
	import NarrowNavlink from './narrow/NarrowNavlink.svelte'

	export let href: string | undefined = undefined
	export let c2a = false
	export let ariaLabel: string | undefined = undefined
	export let inverted = false
	export let first = false
	export let narrow = false
	export let external = false
</script>

<span class="wide-navlink">
	<WideNavlink {href} {c2a} {ariaLabel} {inverted} {first} {narrow} {external}>
		<slot />
	</WideNavlink>
</span>
<span class="narrow-navlink">
	<NarrowNavlink {href} {c2a} {ariaLabel} {inverted} {first} {narrow} {external}>
		<slot />
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
