<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import Hero from '../home/hero.svelte'
	import Lead from '../home/lead.svelte'
	import Risks from '../home/risks.svelte'
	import Articles from '../home/articles.svelte'
	import Faq from '../home/faq.svelte'

	const title = 'We need to Pause AI'
	const description = 'We are risking human extinction. We need to pause AI development, right now.'
</script>

<PostMeta {title} {description} />

<Hero />

<Lead />

<Risks />

<Articles />

<Faq />

<style>
	:global(.hero + section) {
		margin-top: calc(100vh);
	}
	:global(section + section) {
		padding-top: 2rem;
	}

	@media (min-width: 600px) {
		:global(.hero + section) {
			margin-top: calc(100vh - 6rem);
		}
		:global(section + section) {
			padding-top: 7.5rem;
		}
	}
</style>
