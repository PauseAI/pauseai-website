<script lang="ts">
	interface Props {
		errorMessage?: string | undefined
	}

	let { errorMessage = undefined }: Props = $props()
</script>

{#if errorMessage}
	<h1>Error</h1>
	<p class="error">{errorMessage}</p>
{:else}
	<h1>Processing your request...</h1>
{/if}
