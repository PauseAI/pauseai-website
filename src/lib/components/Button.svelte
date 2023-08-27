<script lang="ts">
	export let subtle = false
</script>

<button on:click class:subtle>
	<slot />
</button>

<style>
	button {
		background-color: var(--brand);
		color: var(--background);
		border: none;
		border-radius: 10px;
		padding: 10px;
		font-size: var(--font-size);
		font-family: var(--font-body);
		cursor: pointer;
		display: flex;
		font-weight: bold;
		color: var(--bg);
		position: relative;
	}
	button.subtle {
		background-color: var(--background);
		color: var(--brand);
	}
	button.subtle:hover {
		background-color: var(--background);
		text-decoration: underline;
	}
	button:hover {
		background-color: var(--brand-subtle);
	}
	button:active {
		background-color: var(--brand);
	}
</style>
