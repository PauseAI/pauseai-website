<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { meta } from './meta'
	import Signatory from './signatory.svelte'
	export let data
	const { signatories } = data
	const { title, description, date } = meta

	const visibleSignatories = signatories.filter(signatory => !signatory.privacy);
</script>

<PostMeta {title} {description} {date} />

<h1>{title}</h1>

<h2>We call on the governments of the world to sign an international treaty implementing a temporary pause on the training of the most powerful general AI systems, until we know how to build them safely and keep them under democratic control.</h2>

<section data-pagefind-ignore>
	{#if visibleSignatories.length === 0}
		<p>No signatories found</p>
	{/if}
	<ul class="signatories">
		{#each visibleSignatories as { first_name, last_name, country, bio }}
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
