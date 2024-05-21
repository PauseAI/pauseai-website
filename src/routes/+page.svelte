<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import Hero from './hero.svelte'
	import Risks from './risks.svelte'
	import Lead from './lead.svelte'
	import Faq from './faq.svelte'

	const title = 'We need to Pause AI'
	const description = 'We are risking human extinction. We need to pause AI development, right now.'
</script>

<PostMeta {title} {description} />

<Hero />

<Lead />

<Risks />

<Faq />

<style>
	:global(.hero + section) {
		margin-top: 100vh;
	}
	:global(section + section) {
		margin-top: 16rem;
	}
</style>
