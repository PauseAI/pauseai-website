<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { meta } from '../../statement/meta'
	import StatementForm from '../../statement/StatementForm.svelte'
</script>

<!-- The iframeable /statement form for chapter sites (docs/statement-signing-api.md). It
     posts to /statement/sign like /statement, from this page's own origin, so the action's
     CSRF check and Turnstile's hostname check pass whichever site frames it. -->
<PostMeta title={meta.title} description={meta.description} />

<noscript>
	<p class="no-js">
		Signing needs JavaScript. You can also sign at
		<a href="https://pauseai.info/statement" target="_blank" rel="noopener"
			>pauseai.info/statement</a
		>.
	</p>
</noscript>

<StatementForm embedded />

<style>
	.no-js {
		margin: 0 0 1rem;
		text-align: center;
	}
</style>
