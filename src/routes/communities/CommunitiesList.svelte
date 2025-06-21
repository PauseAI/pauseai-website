<script lang="ts">
	import type { Community } from './communities'

	export let communities: Community[] = []
</script>

{#each communities.filter((community) => !community.adjacent) as community}
	<div class="community">
		<h2><a href={community.link}>{community.name}</a></h2>
	</div>
{/each}
