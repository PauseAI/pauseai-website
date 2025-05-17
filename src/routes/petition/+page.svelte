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

<h2>We call on the governments of the world to sign an international treaty implementing a temporary pause on the training of the most powerful general AI systems, until we know how to build them safely and keep them under democratic control.</h2>

<iframe
    class="airtable-embed"
    src="https://airtable.com/embed/appWPTGqZmUcs3NWu/pagUTBbn9qea358FB/form"
    frameborder="0"
    width="100%"
    height="533"
    style="background: transparent; border: 1px solid #ccc;"
></iframe>

<h3>Signatories</h3>
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
