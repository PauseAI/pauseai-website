<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { meta } from '../../statement/meta'
	import StatementForm from '../../statement/StatementForm.svelte'
</script>

<!-- The iframeable /statement form for chapter sites (docs/statement-signing-api.md). It
     posts to /statement/sign like /statement, from this page's own origin, so the action's
     CSRF check and Turnstile's hostname check pass whichever site frames it. -->
<PostMeta title={meta.title} description={meta.description} />

<div class="embed-wrap">
	<StatementForm headingLevel={1} />
</div>

<style>
	/* The padding keeps the card's margins and shadow inside what the layout measures, as
	   margins would otherwise collapse through it and leave the iframe short. */
	.embed-wrap {
		padding: 1rem;
	}

	.embed-wrap > :global(section.card) {
		margin: 0 auto;
	}
</style>
