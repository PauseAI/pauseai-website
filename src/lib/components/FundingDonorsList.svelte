<script lang="ts">
	import Link from '$lib/components/Link.svelte'
	import { getTopPublicDonors } from '$lib/funding-donors.remote'

	const donors = await getTopPublicDonors()
</script>

<ul>
	{#each donors as d}
		<li>
			{d.amountEur.toLocaleString('en-US')} ({#if d.url}<Link href={d.url}>{d.source}</Link
				>{:else}{d.source}{/if}{#if d.notes}, {d.notes}{/if})
		</li>
	{/each}
</ul>
