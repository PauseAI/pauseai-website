<script lang="ts">
	import PressCoveragePanel from './PressCoveragePanel.svelte'
	import { getPressCoverage } from '$lib/press-coverage.remote'

	const pressCoveragePromise = getPressCoverage()
</script>

{#await pressCoveragePromise then { coverage, typeOrder, outletOrder }}
	<PressCoveragePanel {coverage} {typeOrder} {outletOrder} />
{/await}
