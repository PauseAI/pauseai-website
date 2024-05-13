<script lang="ts">
	export let subtle = false
	export let href = ''
</script>

{#if href}
	<a class="button-link" {href}>
		<button on:click class:subtle>
			<slot />
		</button>
	</a>
{:else}
	<button on:click class:subtle>
		<slot />
	</button>
{/if}

<style>
	button {
		background-color: var(--button-default);
		color: var(--button-text);
		border: none;
		border-radius: 0.3125rem;
		padding: 10px;
		/* font-size: var(--font-size); */
		font-family: var(--font-body);
		cursor: pointer;
		display: flex;
		font-weight: bold;
		position: relative;
		min-width: 10rem;
		height: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.125rem;
	}
	.button-link {
		/* color: var(--text); */
		text-decoration: none;
	}
	button.subtle {
		/* background-color: var(--background); */
		background-color: var(--button-alt-default);
		/* color: var(--brand); */
	}
	button.subtle:hover {
		/* background-color: var(--background); */
		background-color: var(--button-alt-hover);
		/* text-decoration: underline; */
	}
	button:hover {
		/* background-color: var(--brand-subtle); */
		background-color: var(--button-hover);
	}
	button:active {
		/* background-color: var(--brand); */
		background-color: var(--button-default);
	}
</style>
