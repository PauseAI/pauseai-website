<script lang="ts">
	import DesktopNavlink from './desktop/DesktopNavbar.svelte'
	import MobileNavlink from './mobile/MobileNavbar.svelte'
</script>

<span class="desktop-navlink">
	<DesktopNavlink>
		<slot />
	</DesktopNavlink>
</span>
<span class="mobile-navlink">
	<MobileNavlink>
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
