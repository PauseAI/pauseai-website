<script lang="ts">
	import { onMount } from 'svelte'
	import { theme, userTheme } from '$lib/theme'
	import { get } from 'svelte/store'

	// Store the original user theme preference immediately
	const originalUserTheme = get(userTheme)

	// Force dark theme immediately to avoid flash
	theme.set('dark')

	onMount(() => {
		// Clean up when leaving this page
		return () => {
			// Restore the original user theme preference, which will compute the right theme
			userTheme.set(originalUserTheme)
		}
	})
</script>

<slot />
