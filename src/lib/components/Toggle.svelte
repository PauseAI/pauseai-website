<script lang="ts">
	import { userTheme, toggleTheme } from '$lib/theme'
</script>

<button on:click={toggleTheme} aria-label="Toggle theme">{$userTheme} Theme</button>

<style>
	button {
		font-family: var(--font-body);
		padding: 0;
		color: var(--text);
		font-weight: inherit;
		background: none;
		border: none;
		box-shadow: none;
		overflow: hidden;
		cursor: pointer;
		text-transform: capitalize;
	}

	button:hover {
		text-decoration: underline;
	}

	button > * {
		display: flex;
	}
</style>
