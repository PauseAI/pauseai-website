<script lang="ts">
	import { onMount } from 'svelte'
	import PressCoveragePanel from './PressCoveragePanel.svelte'
	import { getPressCoverage } from '$lib/press-coverage.remote'

	let data: Awaited<ReturnType<typeof getPressCoverage>> = {
		coverage: [],
		typeOrder: [],
		outletOrder: []
	}
	let loading = true

	onMount(async () => {
		try {
			data = await getPressCoverage()
		} catch (error) {
			console.error('Failed to fetch press coverage:', error)
		} finally {
			loading = false
		}
	})
</script>

<PressCoveragePanel {...data} {loading} />
