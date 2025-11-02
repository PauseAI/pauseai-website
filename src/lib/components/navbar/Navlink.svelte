<script lang="ts">
	import DesktopNavlink from './desktop/DesktopNavlink.svelte'
	import MobileNavlink from './mobile/MobileNavlink.svelte'

	export let href: string | undefined = undefined
	export let c2a = false
	export let ariaLabel: string | undefined = undefined
	export let inverted = false
	export let first = false
	export let narrow = false
	export let active = false
	export let external = false
</script>

<span class="desktop-navlink">
	<DesktopNavlink {href} {c2a} {ariaLabel} {inverted} {first} {narrow} {active} {external}>
		<slot />
	</DesktopNavlink>
</span>
<span class="mobile-navlink">
	<MobileNavlink {href} {c2a} {ariaLabel} {inverted} {first} {narrow} {active} {external}>
		<slot />
	</MobileNavlink>
</span>

<style>
	:global(.mobile-navbar) .desktop-navlink {
		display: none;
	}

	:global(.desktop-navbar) .mobile-navlink {
		display: none;
	}
</style>
