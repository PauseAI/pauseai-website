<script lang="ts">
</script>

<button on:click>
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
		align-self: flex-end;
		font-weight: bold;
		color: var(--bg);
		position: relative;
	}
	button:hover {
		background-color: var(--brand-subtle);
	}
	button:active {
		background-color: var(--brand);
	}
</style>
