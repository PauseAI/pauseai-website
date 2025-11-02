<script lang="ts">
	import DesktopNavbar from './desktop/DesktopNavbar.svelte'
	import MobileNavbar from './mobile/MobileNavbar.svelte'
</script>

<div class="desktop-navbar">
	<DesktopNavbar>
		<slot />
	</DesktopNavbar>
</div>
<div class="mobile-navbar">
	<MobileNavbar>
		<slot />
	</MobileNavbar>
</div>

<style>
	.desktop-navbar {
		display: default;
	}

	.mobile-navbar {
		display: none;
	}

	@media (max-width: 600px) {
		.desktop-navbar {
			display: none;
		}

		.mobile-navbar {
			display: default;
		}
	}
</style>
