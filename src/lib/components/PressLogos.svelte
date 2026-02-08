<script lang="ts">
	// Using ?url to ensure Vite gives us the static asset path
	import time from '$assets/images/press/Time_Magazine_logo.svg?url'
	import wired from '$assets/images/press/Wired_logo.svg.png?url'
	import verge from '$assets/images/press/The_Verge_wordmark_2022.svg.png?url'
	import bloomberg from '$assets/images/press/Bloomberg-Logo.png?url'
	import fortune from '$assets/images/press/960px-FORTUNE-LOGO-2016.png?url'
	import politico from '$assets/images/press/POLITICOLOGO.svg.png?url'

	const publications = [
		{
			name: 'Time',
			logo: time,
			url: 'https://time.com/6295879/ai-pause-is-humanitys-best-bet-for-preventing-extinction/'
		},
		{
			name: 'Wired',
			logo: wired,
			url: 'https://www.wired.com/story/pause-ai-existential-risk/'
		},
		{
			name: 'The Verge',
			logo: verge,
			url: 'https://www.theverge.com/2023/5/24/23735982/sam-altman-openai-superintelligent-benefits-talk-london-ucl-protests'
		},
		{
			name: 'Bloomberg',
			logo: bloomberg,
			url: 'https://www.bloomberg.com/news/newsletters/2024-02-13/ai-protest-at-openai-hq-in-san-francisco-focuses-on-military-work'
		},
		{
			name: 'Fortune',
			logo: fortune,
			url: 'https://fortune.com/2023/05/24/openai-ceo-sam-altman-credits-elon-musk-with-teaching-him-the-importance-of-deep-tech-investing-but-he-has-no-interest-in-living-on-mars/'
		},
		{
			name: 'Politico',
			logo: politico,
			url: 'https://www.politico.eu/article/microsoft-brussels-elon-musk-anti-ai-protesters-well-five-of-them-descend-on-brussels/'
		}
	]
</script>

<div class="press-section">
	<div class="container">
		<h2 class="section-title">Media Coverage</h2>
		<div class="logos-row">
			{#each publications as pub}
				<a href={pub.url} target="_blank" class="pub-link">
					<!-- Visible on hover (Original Color) -->
					<img
						src={pub.logo}
						alt={pub.name}
						title={pub.name}
						class="logo-img logo-{pub.name.toLowerCase().replace(' ', '-')}"
					/>
					<!-- Visible by default (Theme Color Mask) -->
					<div
						class="logo-mask logo-{pub.name.toLowerCase().replace(' ', '-')}"
						style="--url: url({pub.logo})"
					></div>
				</a>
			{/each}

			<a href="/press" class="see-all"> See all coverage → </a>
		</div>
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

	.logos-row {
		display: flex;
		flex-wrap: wrap;
		gap: 2rem 3rem;
		align-items: center;
		justify-content: center;
	}

	.pub-link {
		text-decoration: none;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		transition: transform 0.2s;
	}

	.pub-link:hover {
		transform: translateY(-2px);
	}

	/* The Color Image (Hidden by default) */
	.logo-img {
		height: 1.6rem;
		width: auto;
		max-width: 150px;
		opacity: 0; /* Fully hidden initially */
		transition: opacity 0.2s ease;
		display: block;
	}

	/* Dark Mode Visibility Fixes for Black Logos on Hover */
	/* Invert black logos to white in dark mode so they are visible */

	:global([color-scheme='dark']) .pub-link:hover .logo-wired,
	:global([color-scheme='dark']) .pub-link:hover .logo-bloomberg {
		filter: invert(1);
	}

	/* The Mask (Visible by default) */
	.logo-mask {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: var(--text);
		opacity: 0.6;
		-webkit-mask-image: var(--url);
		mask-image: var(--url);
		-webkit-mask-size: contain;
		mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		mask-repeat: no-repeat;
		-webkit-mask-position: center;
		mask-position: center;
		pointer-events: none;
		transition: opacity 0.2s ease;
	}

	/* Hover State */
	.pub-link:hover .logo-img {
		opacity: 1; /* Show color image */
	}

	.pub-link:hover .logo-mask {
		opacity: 0; /* Hide mask */
	}

	/* Logo Specific Sizing */
	.logo-time {
		height: 1.4rem !important;
	}
	.logo-bloomberg {
		height: 1.8rem !important;
	}
	.logo-fortune {
		height: 1.6rem !important;
	}
	.logo-politico {
		height: 1.2rem !important;
	}

	.see-all {
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

	.see-all:hover {
		opacity: 1;
		text-decoration: underline;
	}

	@media (max-width: 768px) {
		.logos-row {
			gap: 1.5rem 2.5rem;
		}

		.logo-img {
			height: 1.3rem;
		}
	}

	@media (max-width: 600px) {
		.see-all {
			width: 100%;
			margin-left: 0;
			margin-top: 1.5rem;
		}
	}
</style>
