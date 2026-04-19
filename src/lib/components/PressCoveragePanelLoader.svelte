<script lang="ts">
	import PressCoveragePanel from './PressCoveragePanel.svelte'
	import { getPressCoverage } from '$lib/press-coverage.remote'

	const { coverage, typeOrder, outletOrder } = await getPressCoverage()
</script>

<PressCoveragePanel {coverage} {typeOrder} {outletOrder} />
