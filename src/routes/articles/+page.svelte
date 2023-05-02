<script lang="ts">
	import { posts } from '$lib/stores/posts.store';
</script>

{#each $posts as post}
	<div>
		<a href="/{post.slug}" style="margin-top: 4px; font-size: 24px;">
			{post.title}
		</a>
		<p>{post.datePublished}</p>
	</div>
	<hr />
{/each}
