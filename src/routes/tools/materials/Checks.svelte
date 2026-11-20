<script lang="ts">
	import type { LintIssue } from '$lib/materials/lint'

	let { issues, title = 'Checks' }: { issues: LintIssue[]; title?: string } = $props()
</script>

<!-- The automatic checks for a design, shown beside Download. -->
<div class="checks" role="status">
	<strong>{title}</strong>
	{#if issues.length === 0}
		<p class="check ok">✓ No problems found.</p>
	{:else}
		<ul>
			{#each issues as issue (issue.id)}
				<li class="check" class:warn={issue.level === 'warn'}>
					<span aria-hidden="true">{issue.level === 'warn' ? '⚠' : 'ℹ'}</span>
					{issue.message}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.checks {
		flex-basis: 100%;
		padding: 0.75rem 0.875rem;
		border: 1px solid var(--grey-150);
		border-radius: 8px;
		font-size: 0.875rem;
		text-align: left;
	}

	ul {
		display: grid;
		gap: 0.375rem;
		margin: 0.375rem 0 0;
		padding: 0;
		list-style: none;
	}

	.check {
		margin: 0.375rem 0 0;
		color: var(--text-2);
	}

	.ok {
		color: var(--success-text);
	}

	.warn {
		color: var(--text);
	}

	:global([color-scheme='dark']) .ok {
		color: var(--status-success-text-alt);
	}
</style>
