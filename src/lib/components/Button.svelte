<script lang="ts">
	export let subtle = false
	export let href = ''
</script>

{#if href}
	<a {href} class:subtle>
		<slot />
	</a>
{:else}
	<button on:click class:subtle>
		<slot />
	</button>
{/if}

<style>
	button,
	a {
		background-color: var(--button-default);
		color: var(--button-text);
		border: none;
		border-radius: 0.3125rem;
		padding: 10px;
		/* font-size: var(--font-size); */
		font-family: var(--font-body);
		cursor: pointer;
		display: inline-flex;
		font-weight: bold;
		position: relative;
		min-width: 10rem;
		height: 3rem;
		align-items: center;
		justify-content: center;
		font-size: 1.125rem;
		text-decoration: none;
	}
	button.subtle,
	a.subtle {
		/* background-color: var(--background); */
		background-color: var(--button-alt-default);
		color: var(--button-text);
		/* color: var(--brand); */
	}
	button.subtle:hover,
	a.subtle:hover {
		/* background-color: var(--background); */
		background-color: var(--button-alt-hover);
		color: var(--button-text);
		/* text-decoration: underline; */
	}
	button:hover,
	a:hover {
		/* background-color: var(--brand-subtle); */
		background-color: var(--button-hover);
		color: var(--button-text);
	}
	button:active,
	a:active {
		/* background-color: var(--brand); */
		background-color: var(--button-default);
		color: var(--button-text);
	}
</style>
