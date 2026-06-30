<script lang="ts">
	import WideNavbar from './wide/WideNavbar.svelte'
	import NarrowNavbar from './narrow/NarrowNavbar.svelte'
	import type { NavItem } from './navItems'

	interface Props {
		items: NavItem[]
		inverted?: boolean
		/** Trailing controls (language switcher, search) rendered after the menu. */
		extras?: import('svelte').Snippet
	}

	let { items, inverted = false, extras }: Props = $props()
</script>

<div class="wide-navbar">
	<WideNavbar {items} {inverted} {extras} />
</div>
<div class="narrow-navbar">
	<NarrowNavbar {items} {inverted} {extras} />
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
