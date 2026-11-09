<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import Link from '$lib/components/Link.svelte'
	import StatementThanks from '../StatementThanks.svelte'
	import { meta } from '../meta'
	import type { ActionData } from './$types'

	// Reached only when the form on /statement posts before its JavaScript has run, or by
	// opening this URL directly. The form itself lives on /statement.
	let { form }: { form: ActionData } = $props()
</script>

<PostMeta title={meta.title} description={meta.description} date={meta.date} />

<h1>{meta.title}</h1>

{#if form?.success}
	<StatementThanks headingLevel={2} />
{:else}
	{#if form?.message}
		<p role="alert">{form.message}</p>
	{/if}
	<p><Link href="/statement">Go to the statement to sign it.</Link></p>
{/if}
