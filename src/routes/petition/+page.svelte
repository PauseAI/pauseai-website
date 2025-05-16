<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { meta } from './meta'
	import Signatory from './signatory.svelte'
	export let data
	const { signatories } = data
	const { title, description, date } = meta
</script>

<PostMeta {title} {description} {date} />

<h1>{title}</h1>

<h2>We should pause AI, actually.</h2>

<section data-pagefind-ignore>
	{#if signatories.length === 0}
		<p>No signatories found</p>
	{/if}
	<ul class="signatories">
		{#each signatories as { first_name, last_name, country, bio }}
			<Signatory {first_name} {last_name} {country} {bio} />
		{/each}
	</ul>
</section>

<style>
	.signatories {
		display: grid;
		gap: 1rem;
	}
</style>
