<script lang="ts">
	import ArticleCard from '$components/ArticleCard.svelte'
	import Button from '$components/Button.svelte'
	import UnderlinedTitle from '$components/UnderlinedTitle.svelte'
	const label_id = 'articles-title'
</script>

<section aria-labelledby={label_id}>
	<UnderlinedTitle id={label_id}>Nos articles mis en avant</UnderlinedTitle>
	<div class="articles-grid">
		<ArticleCard
			title="The difficult psychology of existential risk"
			blurb="A framework for thinking about how to mitigate the risks from powerful AI systems"
			category="Gouvernance"
			url="/risks"
		/>
		<ArticleCard
			title="The difficult psychology of existential risk"
			blurb="A framework for thinking about how to mitigate the risks from powerful AI systems. And this card description takes up two lines."
			category="Gouvernance"
			url="/risks"
		/>
		<ArticleCard
			title="The difficult psychology of existential risk"
			blurb="A framework for thinking about how to mitigate the risks from powerful AI systems"
			category="Gouvernance"
			url="/risks"
		/>
		<ArticleCard
			title="The difficult psychology of existential risk"
			blurb="A framework for thinking about how to mitigate the risks from powerful AI systems"
			category="Gouvernance"
			url="/risks"
		/>
		<ArticleCard
			title="The difficult psychology of existential risk"
			blurb="A framework for thinking about how to mitigate the risks from powerful AI systems"
			category="Gouvernance"
			url="/risks"
		/>
		<ArticleCard
			title="The difficult psychology of existential risk"
			blurb="A framework for thinking about how to mitigate the risks from powerful AI systems"
			category="Gouvernance"
			url="/risks"
		/>
	</div>
	<Button href="/posts">Voir tous les articles</Button>
</section>

<style>
	.articles-grid {
		display: grid;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	@media (min-width: 640px) {
		.articles-grid {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
