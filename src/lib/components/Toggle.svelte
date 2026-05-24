<script lang="ts">
	import { userTheme, toggleTheme } from '$lib/theme'
</script>

<button class="button-to-link" onclick={toggleTheme} aria-label="Toggle theme"
	>{$userTheme} Theme</button
>

<style>
	button {
		text-transform: capitalize;
	}
</style>
