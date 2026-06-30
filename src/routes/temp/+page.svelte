<script lang="ts">
	import { env } from '$env/dynamic/public'

	// Set PUBLIC_TEMP_PHONE in Netlify (and in a local .env for dev).
	// Kept out of the repo so the number is never committed to git history.
	const phone = env.PUBLIC_TEMP_PHONE ?? ''
</script>

<svelte:head>
	<title>·</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<!-- data-pagefind-ignore excludes this page from the site's Pagefind search index -->
<div class="temp" data-pagefind-ignore>
	{#if phone}
		<p class="number">{phone}</p>
	{/if}
</div>

<style>
	.temp {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
	}

	.number {
		margin: 0;
		font-size: clamp(1.75rem, 7vw, 3.5rem);
		font-weight: 300;
		letter-spacing: 0.04em;
		text-align: center;
		color: var(--text);
	}
</style>
