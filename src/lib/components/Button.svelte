<script lang="ts">
	export let alt = false
	export let href = ''
</script>

{#if href}
	<a {href} class:alt>
		<slot />
	</a>
{:else}
	<button on:click class:alt>
		<slot />
	</button>
{/if}

<style>
	button,
	a {
		background-color: var(--btn-bg);
		color: var(--text) !important;
		border: none;
		border-radius: 0.3125rem;
		padding: 0.5rem 1rem;
		font-family: var(--font-body);
		cursor: pointer;
		display: inline-flex;
		font-weight: bold;
		position: relative;
		min-width: 7rem;
		/* Appropriate tap targets */
		height: 48px;
		align-items: center;
		justify-content: center;
		text-decoration: none;
		max-width: fit-content;
	}

	button.alt,
	a.alt {
		background-color: var(--btn-alt-bg);
	}
	button.alt:hover,
	a.alt:hover {
		background-color: var(--btn-alt-hover-bg);
	}
	button:hover,
	a:hover {
		background-color: var(--btn-hover-bg);
	}
	button:active,
	a:active {
		background-color: var(--btn-active-bg);
		/* using box-shadow instead of border prevents layout shifts */
		box-shadow: inset 0 0 0 0.125rem var(--btn-active-border);
	}
	button.alt:active,
	a.alt:active {
		background-color: var(--btn-alt-active-bg);
		box-shadow: inset 0 0 0 0.125rem var(--btn-alt-active-border);
	}
	button:focus-visible,
	a:focus-visible {
		background-color: var(--btn-focus-bg);
		outline: var(--btn-focus-border) solid 0.25rem;
		outline-offset: 0;
	}
	button.alt:focus-visible,
	a.alt:focus-visible {
		background-color: var(--btn-alt-focus-bg);
		outline: var(--btn-alt-focus-border) solid 0.25rem;
		outline-offset: 0;
	}
</style>
