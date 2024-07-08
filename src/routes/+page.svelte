<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import Hero from '$lib/components/home/hero.svelte'
	import Lead from '$lib/components/home/lead.svelte'
	import Risks from '$lib/components/home/risks.svelte'
	import Articles from '$lib/components/home/articles.svelte'
	import Faq from '$lib/components/home/faq.svelte'
	import Supporters from '$lib/components/home/supporters.svelte'

	const title = 'We need to Pause AI'
	const description = 'We are risking human extinction. We need to pause AI development, right now.'
</script>

<PostMeta {title} {description} />

<Hero />

<Lead />

<Risks />

<Supporters />

<Articles />

<Faq />
