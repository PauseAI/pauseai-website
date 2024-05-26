<script>
	import ArticleCard from '$lib/components/ArticleCard.svelte'
	import Button from '$lib/components/Button.svelte'
	const label_id = 'articles-title'
</script>

<section aria-labelledby={label_id}>
	<h2 id={label_id}>Nos articles mis en avant</h2>
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
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		margin-bottom: 2rem;
	}
</style>
