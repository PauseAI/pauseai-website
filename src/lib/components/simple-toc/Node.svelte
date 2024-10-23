<script lang="ts">
	import Link from '../custom/a.svelte'

	export let headings: Element[]

	$: level = extractLevel(headings[0])

	// state is shared between recursively created instances
	let instance = 0
	$: instance++
	let done = new Map<number, boolean>()

	function extractLevel(heading: Element): number {
		return parseInt(heading.tagName.substring(1))
	}

	function markDone() {
		done.set(instance, true)
		return ''
	}
</script>

<ul>
	{#each headings as heading, i}
		{#if !done.get(instance)}
			{@const currentLevel = extractLevel(heading)}
			{#if i != 0}
				{@const previousLevel = extractLevel(headings[i - 1])}
				{#if previousLevel == level}
					{@const difference = currentLevel - previousLevel}
					{#if difference > 0}
						{@const sliced = headings.slice(i)}
						<svelte:self headings={sliced} />
					{:else if difference < 0}
						{markDone()}
					{/if}
				{/if}
			{/if}
			{#if currentLevel == level}
				<li><Link href={'#' + heading.id}>{heading.textContent}</Link></li>
			{/if}
		{/if}
	{/each}
</ul>
