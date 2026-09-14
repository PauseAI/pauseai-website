<script lang="ts">
	import Link from '$lib/components/Link.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<PostMeta
	title="Onboarding stub — captured submissions"
	description="Testing page showing what the onboarding pipeline would write to Airtable."
/>

<div class="stub-page">
	<h1>Onboarding stub</h1>
	<p class="notice">
		⚠️ Testing page — the Airtable backend is stubbed. Below is exactly what each onboarding
		submission <em>would</em> have written to Airtable. Submissions are held in memory per server
		process and are lost on restart. Refresh after submitting on the
		<Link href="/onboarding">onboarding page</Link>.
	</p>

	{#if data.submissions.length === 0}
		<p class="empty">
			No submissions captured yet. Complete the <Link href="/onboarding">onboarding flow</Link> and refresh
			this page.
		</p>
	{:else}
		{#each data.submissions as submission (submission.id)}
			<section class="submission">
				<header>
					<h2>
						#{submission.id} — {String(submission.fields['Intent'])}
					</h2>
					<span class="timestamp">{submission.receivedAt}</span>
				</header>
				<p class="target">
					Would create record in base <code>{submission.airtable.baseId}</code>, table
					<code>{submission.airtable.tableName}</code> (<code>{submission.airtable.tableId}</code>)
				</p>
				<h3>Fields</h3>
				<pre>{JSON.stringify(submission.fields, null, 2)}</pre>
				<h3>Processing notes</h3>
				<pre>{JSON.stringify(submission.meta, null, 2)}</pre>
			</section>
		{/each}
	{/if}
</div>

<style>
	.stub-page {
		max-width: 800px;
		margin: 0 auto;
		padding: 0.5rem 0 2rem 0;
		color: var(--text);
	}

	h1 {
		font-family: var(--font-heading);
	}

	.notice {
		background-color: var(--bg-subtle);
		border: 1px solid var(--brand);
		border-radius: 8px;
		padding: 1rem;
	}

	.empty {
		opacity: 0.8;
	}

	.submission {
		background-color: var(--bg-subtle);
		border-radius: 8px;
		padding: 1rem 1.5rem;
		margin-bottom: 1.5rem;
	}

	.submission header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.submission h2 {
		font-family: var(--font-heading);
		font-size: 1.3rem;
		margin: 0;
	}

	.submission h3 {
		font-size: 1rem;
		margin-bottom: 0.25rem;
	}

	.timestamp {
		font-size: 0.85rem;
		opacity: 0.7;
	}

	.target {
		font-size: 0.9rem;
		opacity: 0.85;
	}

	pre {
		background-color: var(--bg);
		border-radius: 6px;
		padding: 0.75rem 1rem;
		overflow-x: auto;
		font-size: 0.85rem;
		white-space: pre-wrap;
		word-break: break-word;
	}
</style>
