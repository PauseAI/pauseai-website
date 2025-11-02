<script lang="ts">
	import DesktopNavbar from './desktop/DesktopNavbar.svelte'
	import MobileNavbar from './mobile/MobileNavbar.svelte'

	export let inverted = false
	export let moveUp = false
</script>

<div class="desktop-navbar">
	<DesktopNavbar {inverted} {moveUp}>
		<slot />
	</DesktopNavbar>
</div>
<div class="mobile-navbar">
	<MobileNavbar {inverted} {moveUp}>
		<slot />
	</MobileNavbar>
</div>

<style>
	.desktop-navbar {
		display: unset;
	}

	.mobile-navbar {
		display: none;
	}

	@media (max-width: 600px) {
		.desktop-navbar {
			display: none;
		}

		.mobile-navbar {
			display: unset;
		}
	}
</style>
