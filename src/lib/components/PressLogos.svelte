<script lang="ts">
	import Image from '$lib/components/Image.svelte'
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'
	import { motion } from 'motion-sv'

	const publications = [
		{
			name: 'Time',
			src: '/press/Time_Magazine_logo.svg',
			url: 'https://time.com/6295879/ai-pause-is-humanitys-best-bet-for-preventing-extinction/'
		},
		{
			name: 'Wired',
			src: '/press/Wired_logo.svg.png',
			url: 'https://www.wired.com/story/pause-ai-existential-risk/'
		},
		{
			name: 'The Verge',
			src: '/press/The_Verge_wordmark_2022.svg.png',
			url: 'https://www.theverge.com/2023/5/24/23735982/sam-altman-openai-superintelligent-benefits-talk-london-ucl-protests'
		},
		{
			name: 'Bloomberg',
			src: '/press/Bloomberg-Logo.png',
			url: 'https://www.bloomberg.com/news/newsletters/2024-02-13/ai-protest-at-openai-hq-in-san-francisco-focuses-on-military-work'
		},
		{
			name: 'Fortune',
			src: '/press/960px-FORTUNE-LOGO-2016.png',
			url: 'https://fortune.com/2023/05/24/openai-ceo-sam-altman-credits-elon-musk-with-teaching-him-the-importance-of-deep-tech-investing-but-he-has-no-interest-in-living-on-mars/'
		},
		{
			name: 'Politico',
			src: '/press/POLITICOLOGO.svg.png',
			url: 'https://www.politico.eu/article/microsoft-brussels-elon-musk-anti-ai-protesters-well-five-of-them-descend-on-brussels/'
		}
	]

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1
			}
		}
	}

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.5 }
		}
	}
</script>

<div class="press-section">
	<div class="container">
		<h2 class="section-title">Media Coverage</h2>
		<motion.div
			class="logos-row"
			variants={containerVariants}
			initial="hidden"
			whileInView="visible"
			inViewOptions={{ once: true }}
		>
			{#each publications as pub, i}
				<motion.div variants={itemVariants}>
					<LinkWithoutIcon href={pub.url} target="_blank" class="pub-link">
						<Image
							src={pub.src}
							alt={pub.name}
							title={pub.name}
							class="logo-img logo-{pub.name.toLowerCase().replace(' ', '-')}"
						/>
					</LinkWithoutIcon>
				</motion.div>
			{/each}

			<motion.div variants={itemVariants}>
				<LinkWithoutIcon href="/press" class="see-all">See all coverage →</LinkWithoutIcon>
			</motion.div>
		</motion.div>
	</div>
</div>

<style>
	.press-section {
		padding: 0;
		background-color: var(--bg);
	}

	.container {
		max-width: var(--page-width);
		margin: 0 auto;
		text-align: center;
	}

	.section-title {
		font-size: 0.8rem;
		text-transform: uppercase;
		color: var(--text); /* Changed from text-subtle to match logos */
		margin-bottom: 2rem;
		letter-spacing: 0.15em;
		opacity: 0.6; /* Changed from 0.4 to match logos */
	}

	* :global(.logos-row) {
		display: flex;
		flex-wrap: wrap;
		gap: 2rem 3rem;
		align-items: center;
		justify-content: center;
	}

	* :global(.pub-link) {
		text-decoration: none;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		transition: transform 0.2s;
	}

	* :global(.pub-link:hover) {
		transform: translateY(-2px);
	}

	/* Forced monochrome per theme */
	* :global(.logo-img) {
		height: 1.6rem;
		width: auto;
		max-width: 150px;
		opacity: 0.6;
		filter: grayscale(1) brightness(0);
		transition:
			opacity 0.2s ease,
			filter 0.2s ease;
		display: block;
	}

	/* Hover State */
	* :global(.pub-link:hover) :global(.logo-img) {
		opacity: 1;
		filter: none;
	}

	/* Dark mode: force pure white */
	:global([color-scheme='dark']) * :global(.logo-img) {
		filter: grayscale(1) brightness(0) invert(1);
	}

	/* Dark mode hover: keep black logos visible */
	:global([color-scheme='dark']) * :global(.pub-link:hover) :global(.logo-wired),
	:global([color-scheme='dark']) * :global(.pub-link:hover) :global(.logo-bloomberg) {
		filter: invert(1);
	}

	/* Logo Specific Sizing */
	* :global(.logo-time) {
		height: 1.4rem !important;
	}
	* :global(.logo-bloomberg) {
		height: 1.8rem !important;
	}
	* :global(.logo-fortune) {
		height: 1.6rem !important;
	}
	* :global(.logo-politico) {
		height: 1.2rem !important;
	}

	* :global(.see-all) {
		font-size: 0.9rem;
		color: var(--brand);
		text-decoration: none;
		font-weight: 600;
		opacity: 0.8;
		transition: opacity 0.2s;
		white-space: nowrap;
		margin-left: 1rem;
		font-family: var(--font-heading);
		text-transform: uppercase;
	}

	* :global(.see-all:hover) {
		opacity: 1;
		text-decoration: underline;
	}

	@media (max-width: 768px) {
		* :global(.logos-row) {
			gap: 1.5rem 2.5rem;
		}

		* :global(.logo-img) {
			height: 1.3rem;
		}
	}

	@media (max-width: 600px) {
		* :global(.see-all) {
			width: 100%;
			margin-left: 0;
			margin-top: 1.5rem;
		}
	}
</style>
