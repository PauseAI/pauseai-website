<script lang="ts">
	import type { Community } from './communities'

	export let communities: Community[] = []
</script>

<div class="prose">
	<ul>
		{#each communities
			.filter((community) => !community.adjacent)
			.sort((a, b) => a.name.localeCompare(b.name)) as community}
			<li>
				<a href={community.link}>{community.name}</a>
			</li>
		{/each}
	</ul>
</div>
