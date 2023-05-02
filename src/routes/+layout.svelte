<script lang="ts">
	import NavBar from '$lib/components/NavBar.svelte';
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
	<link
		href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@700&family=Slabo+27px&display=swap"
		rel="stylesheet"
	/>
</svelte:head>
<div class="wrapper">
	<NavBar />
	<main>
		<slot />
	</main>
</div>

<style>
	@import url('$lib/reset.css');
	@import url('$lib/theme.css');

	.wrapper {
		color: var(--t-text);
		max-width: 50rem;
		margin: auto;
	}
</style>
