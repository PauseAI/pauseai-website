<script lang="ts">
	import { title } from '$lib/config'

	export let data
	const { props } = data
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<section data-pagefind-ignore>
	<ul class="people">
		{#each props as { name }}
			<li class="person">
				{name}
			</li>
		{/each}
	</ul>
</section>

<style>
	.people {
		display: grid;
		gap: 1rem;
	}

	.person {
		color: var(--text);
		font-family: var(--font-heading);
		font-weight: bold;
		text-decoration: none;
		font-size: 1.3rem;
		text-transform: capitalize;
	}
</style>
