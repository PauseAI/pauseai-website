<script lang="ts">
	import UniversalNavbar from '../universal/UniversalNavbar.svelte'
</script>

<UniversalNavbar {...$$restProps}>
	<slot />
</UniversalNavbar>
