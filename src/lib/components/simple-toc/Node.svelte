<script lang="ts">
	import Link from '../custom/a.svelte'

	export let headings: Element[]

	let level = extractLevel(headings[0])

	function extractLevel(heading: Element): number {
		return parseInt(heading.tagName.substring(1))
	}

	function cutOffHeadings(headings: Element[], level: number) {
		const results: Element[] = []
		for (const heading of headings) {
			if (extractLevel(heading) < level) break
			results.push(heading)
		}
		return results
	}
</script>

<ul>
	{#each cutOffHeadings(headings, level) as heading, i}
		{@const currentLevel = extractLevel(heading)}
		{#if i != 0}
			{@const previousLevel = extractLevel(headings[i - 1])}
			{#if currentLevel > level && previousLevel == level}
				{@const sliced = headings.slice(i)}
				<svelte:self headings={sliced} />
			{/if}
		{/if}
		{#if currentLevel == level}
			<li><Link href={'#' + heading.id}>{heading.textContent}</Link></li>
		{/if}
	{/each}
</ul>
