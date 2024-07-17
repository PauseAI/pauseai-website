<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import Hero from '$lib/components/home/hero.svelte'
	import Lead from '$lib/components/home/lead.svelte'
	import Risks from '$lib/components/home/risks.svelte'
	import Articles from '$lib/components/home/articles.svelte'
	import Faq from '$lib/components/home/faq.svelte'
	import Supporters from '$lib/components/home/supporters.svelte'

	const title = 'Pause IA'
	const description = "Ne laissons pas l'IA nous détruire, agissons maintenant"
</script>

<PostMeta {title} {description} />

<Hero />

<Lead />

<Risks />

<!-- <Supporters /> -->

<!-- <Articles /> -->

<Faq />
