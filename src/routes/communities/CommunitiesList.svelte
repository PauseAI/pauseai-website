<script lang="ts">
	import type { Community } from './communities'
	import Link from '$lib/components/custom/a.svelte'

	export let communities: Community[] = []
</script>

<div class="prose">
	<ul>
		{#each communities
			.filter((community) => !community.adjacent)
			.sort((a, b) => a.name.localeCompare(b.name)) as community}
			<li>
				<Link href={community.link}>{community.name}</Link>
			</li>
		{/each}
	</ul>
</div>
