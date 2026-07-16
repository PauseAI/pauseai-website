<script lang="ts">
	import WideNavbar from './wide/WideNavbar.svelte'
	import NarrowNavbar from './narrow/NarrowNavbar.svelte'

	interface Props {
		inverted?: boolean
		children?: import('svelte').Snippet
	}

	let { inverted = false, children }: Props = $props()
</script>

<div class="wide-navbar">
	<WideNavbar {inverted}>
		{@render children?.()}
	</WideNavbar>
</div>
<div class="narrow-navbar">
	<NarrowNavbar {inverted}>
		{@render children?.()}
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
