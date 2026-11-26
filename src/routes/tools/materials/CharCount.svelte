<script lang="ts">
	let { value, max }: { value: string; max?: number } = $props()
</script>

<!-- "n / max" once a field is 80% full, so a volunteer knows why typing stops. -->
{#if max && value.length >= max * 0.8}
	<span class="count" class:full={value.length >= max} aria-live="polite">
		{value.length} / {max}
	</span>
{/if}

<style>
	.count {
		display: block;
		margin-top: 0.25rem;
		font-size: 0.75rem;
		color: var(--text-2);
		text-align: right;
	}

	.full {
		color: var(--error-text);
	}
</style>
