<script lang="ts">
	import Link from '$lib/components/Link.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import type { PageData } from './$types'
	import type { PublicDonor } from './notion.server'
	import { meta } from './meta'

	export let data: PageData

	const { title, description, date } = meta

	function donorSuffix(d: PublicDonor): string {
		return d.notes
	}
</script>

<PostMeta {title} {description} {date} />

<article>
	<hgroup>
		<h1>{title}</h1>
	</hgroup>

	<div class="prose">
		<svelte:component this={data.intro} />

		<h2>Largest donors</h2>
		<ul>
			{#each data.donors as d}
				<li>
					{d.amountEur.toLocaleString('en-US')} (
					{#if d.url}
						<Link href={d.url}>{d.source}</Link>
					{:else}
						{d.source}
					{/if}
					{#if donorSuffix(d)}
						, {donorSuffix(d)}
					{/if}
					)
				</li>
			{/each}
		</ul>

		<svelte:component this={data.afterDonors} />
	</div>
</article>

<style>
	article {
		max-inline-size: var(--size-content-3);
		margin-inline: auto;
	}

	h1 {
		text-transform: none;
	}

	hgroup {
		margin-top: 0;
	}
</style>
