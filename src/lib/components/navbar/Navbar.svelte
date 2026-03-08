<script lang="ts">
	import WideNavbar from './wide/WideNavbar.svelte'
	import NarrowNavbar from './narrow/NarrowNavbar.svelte'

	export let inverted = false
</script>

<div class="wide-navbar">
	<WideNavbar {inverted}>
		<slot />
	</WideNavbar>
</div>
<div class="narrow-navbar">
	<NarrowNavbar {inverted}>
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
