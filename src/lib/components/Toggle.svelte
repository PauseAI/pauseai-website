<script lang="ts">
	import { fly } from 'svelte/transition'
	import { theme, toggleTheme } from '$lib/theme'
</script>

<button on:click={toggleTheme} aria-label="Toggle theme">
	{#if $theme === 'dark'}
		<div in:fly={{ y: 10 }}>
			<span>Light mode</span>
		</div>
	{:else}
		<div in:fly={{ y: -10 }}>
			<span>Dark mode</span>
		</div>
	{/if}
</button>

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
	}

	button:hover {
		text-decoration: underline;
	}

	button > * {
		display: flex;
	}
</style>
