<script lang="ts">
	import WideNavbar from './wide/WideNavbar.svelte'
	import NarrowNavbar from './narrow/NarrowNavbar.svelte'

	export let inverted = false
	export let moveUp = false
</script>

<div class="wide-navbar">
	<WideNavbar {inverted} {moveUp}>
		<slot />
	</WideNavbar>
</div>
<div class="narrow-navbar">
	<NarrowNavbar {inverted} {moveUp}>
		<slot />
	</NarrowNavbar>
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
