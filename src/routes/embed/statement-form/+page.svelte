<script lang="ts">
	import { page } from '$app/state'
	import Link from '$lib/components/Link.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { onMount } from 'svelte'
	import { meta } from '../../statement/meta'
	import StatementForm from '../../statement/StatementForm.svelte'
	import { presetCountry } from './presetCountry'

	let country = $state('')

	// Read after mount: the page is prerendered, so the query string isn't known on the server.
	onMount(() => {
		country = presetCountry(page.url.searchParams)
	})
</script>

<!-- The iframeable /statement form for chapter sites (docs/statement-signing-api.md). It
     posts to /statement/sign like /statement, from this page's own origin, so the action's
     CSRF check and Turnstile's hostname check pass whichever site frames it. -->
<PostMeta title={meta.title} description={meta.description} />

<noscript>
	<p class="no-js">
		Signing needs JavaScript. You can also sign at
		<Link href="https://pauseai.info/statement" target="_blank">pauseai.info/statement</Link>.
	</p>
</noscript>

<StatementForm embedded bind:country />

<style>
	.no-js {
		margin: 0 0 1rem;
		text-align: center;
	}
</style>
