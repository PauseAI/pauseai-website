<script lang="ts">
	import Navbar from '$lib/components/navbar/Navbar.svelte'

	export let inverted = false
	export let moveUp = false
</script>

<Navbar {inverted} {moveUp} />
