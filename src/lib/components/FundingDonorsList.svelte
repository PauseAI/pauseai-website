<script lang="ts">
	import Link from '$lib/components/Link.svelte'
	import { getTopPublicDonors } from '$lib/funding-donors.remote'
	import Skeleton from '$lib/components/Skeleton.svelte'

	const donorsPromise = getTopPublicDonors()
</script>

{#await donorsPromise}
	<ul>
		{#each Array.from({ length: 15 }) as _, i}
			<li>
				<Skeleton width="50px" />
				<Skeleton width="200px" random seed={i} />
			</li>
		{/each}
	</ul>
{:then donors}
	<ul>
		{#each donors as d}
			<li>
				{d.amountEur.toLocaleString('en-US')} ({#if d.url}<Link href={d.url}>{d.source}</Link
					>{:else}{d.source}{/if}{#if d.notes}, {d.notes}{/if})
			</li>
		{/each}
	</ul>
{/await}
