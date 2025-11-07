<script lang="ts">
	export let errorMessage: string | undefined = undefined
</script>

{#if errorMessage}
	<h1>Error</h1>
	<p class="error">{errorMessage}</p>
{:else}
	<h1>Processing your request...</h1>
{/if}
