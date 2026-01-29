<script lang="ts">
	import Link from './Link.svelte'

	const publications = [
		{
			name: 'Time',
			url: 'https://time.com/6295879/ai-pause-is-humanitys-best-bet-for-preventing-extinction/'
		},
		{ name: 'Wired', url: 'https://www.wired.com/story/pause-ai-existential-risk/' },
		{
			name: 'The Verge',
			url: 'https://www.theverge.com/2023/5/24/23735982/sam-altman-openai-superintelligent-benefits-talk-london-ucl-protests'
		},
		{
			name: 'Bloomberg',
			url: 'https://www.bloomberg.com/news/newsletters/2024-02-13/ai-protest-at-openai-hq-in-san-francisco-focuses-on-military-work'
		},
		{
			name: 'Fortune',
			url: 'https://fortune.com/2023/05/24/openai-ceo-sam-altman-credits-elon-musk-with-teaching-him-the-importance-of-deep-tech-investing-but-he-has-no-interest-in-living-on-mars/'
		},
		{
			name: 'Politico',
			url: 'https://www.politico.eu/article/microsoft-brussels-elon-musk-anti-ai-protesters-well-five-of-them-descend-on-brussels/'
		},
		{
			name: 'Le Monde',
			url: 'https://www.lemonde.fr/en/economy/article/2023/11/27/openai-the-beginnings-of-the-sam-altman-drama_6291282_19.html'
		},
		{
			name: 'Euronews',
			url: 'https://www.euronews.com/next/2023/06/14/could-ai-lead-us-to-extinction-this-brussels-based-group-believes-so'
		}
	]
</script>

<div class="press-section">
	<div class="container">
		<h2 class="section-title">As seen in</h2>
		<div class="logos-row">
			{#each publications as pub}
				<a href={pub.url} target="_blank" rel="noopener noreferrer" class="pub-link">
					<span class="pub-name">{pub.name}</span>
				</a>
			{/each}
		</div>
	</div>
</div>

<style>
	.press-section {
		padding: 2rem 0;
		background-color: var(--bg);
	}

	.container {
		max-width: var(--page-width);
		margin: 0 auto;
		text-align: center;
	}

	.section-title {
		font-size: 0.9rem;
		text-transform: uppercase;
		color: var(--text-subtle);
		margin-bottom: 1.5rem;
		letter-spacing: 0.1em;
		opacity: 0.6;
	}

	.logos-row {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem 2.5rem;
		align-items: center;
		justify-content: center;
		opacity: 0.6;
		transition: opacity 0.3s;
	}

	.logos-row:hover {
		opacity: 1;
	}

	.pub-link {
		text-decoration: none;
		color: var(--text);
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: 1.2rem;
		transition:
			color 0.2s,
			transform 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.pub-link:hover {
		color: var(--brand);
		transform: scale(1.05);
	}

	.pub-name {
		white-space: nowrap;
	}

	@media (max-width: 600px) {
		.press-section {
			padding: 1.5rem 1rem;
		}

		.logos-row {
			gap: 1rem 1.5rem;
		}

		.pub-link {
			font-size: 1rem;
		}
	}
</style>
