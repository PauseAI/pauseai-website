<script lang="ts">
	/** The last post's failure, kept in place beside the toast until the next post. */
	export let message: string
</script>

{#if message}
	<p class="save-error" role="alert">{message}</p>
{/if}

<style>
	.save-error {
		margin: 0 0 1rem;
		padding: 0.7rem 1rem;
		border-left: 4px solid var(--brand);
		background-color: var(--bg);
		color: var(--text);
	}
</style>
