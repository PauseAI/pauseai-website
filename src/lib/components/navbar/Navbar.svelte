<script lang="ts">
	import WideNavbar from './wide/WideNavbar.svelte'
	import NarrowNavbar from './narrow/NarrowNavbar.svelte'
	import type { NavItem } from './navItems'

	interface Props {
		items: NavItem[]
		inverted?: boolean
		/** Trailing controls (language switcher, search) rendered after the wide menu. */
		extras?: import('svelte').Snippet
		/** Controls rendered at the bottom of the narrow (mobile) panel.
		 *  Receives a callback that closes the panel. */
		panelExtras?: import('svelte').Snippet<[() => void]>
	}

	let { items, inverted = false, extras, panelExtras }: Props = $props()
</script>

<div class="wide-navbar">
	<WideNavbar {items} {inverted} {extras} />
</div>
<div class="narrow-navbar">
	<NarrowNavbar {items} {inverted} {panelExtras} />
</div>

<style>
	.wide-navbar {
		display: unset;
	}

	.narrow-navbar {
		display: none;
	}

	@media (max-width: 600px) {
		.wide-navbar {
			display: none;
		}

		.narrow-navbar {
			display: unset;
		}
	}
</style>
