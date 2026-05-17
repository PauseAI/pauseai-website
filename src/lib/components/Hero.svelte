<script lang="ts">
	import homeHeroDesktop from '$assets/protests/Home Hero - web - No Background.png?enhanced'
	import homeHeroMobile from '$assets/protests/Home Hero - mobile - No Background.png?enhanced'

	import Link from '$lib/components/Link.svelte'

	// Current campaign. Update this block when the active campaign changes.
	const campaign = {
		description:
			'AI labs are explicitly racing to automate every job on the planet, including yours, within years. And job loss is only the tip of the iceberg.',
		primary: { href: 'https://tally.so/r/GxBRr2', label: 'Share your story' },
		secondary: { href: '/ai-not-just-coming-for-your-job', label: 'Read more' }
	}
</script>

<div class="hero">
	<picture class="hero-photo">
		{#each Object.entries(homeHeroMobile.sources) as [format, srcset]}
			<source media="(max-width: 850px)" {srcset} sizes="100vw" type={'image/' + format} />
		{/each}
		{#each Object.entries(homeHeroDesktop.sources) as [format, srcset]}
			<source {srcset} sizes="100vw" type={'image/' + format} />
		{/each}
		<img src={homeHeroDesktop.img.src} alt="" fetchpriority="high" />
	</picture>

	<div class="hero-top">
		<div class="hero-top-inner">
			<h1>Join the movement to <em>Pause</em> AI.</h1>
			<div class="hero-buttons">
				<Link href="/join" class="btn-dark">Get involved</Link>
				<Link href="/donate" class="btn-light">Donate</Link>
			</div>
		</div>
	</div>

	<div class="hero-bottom">
		<div class="hero-bottom-inner">
			<span class="hero-badge">
				<span class="hero-badge-dot" aria-hidden="true"></span>
				Active campaign
			</span>
			<h2>AI is not <em>just</em> coming for your job.</h2>
			<p class="hero-copy">{campaign.description}</p>
			<div class="hero-buttons">
				<Link href={campaign.primary.href} class="btn-dark">{campaign.primary.label}</Link>
				{#if campaign.secondary}
					<Link href={campaign.secondary.href} class="btn-light">{campaign.secondary.label}</Link>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.hero {
		position: relative;
		width: 100vw;
		flex: 1;
		left: 50%;
		transform: translateX(-50%);
		background-color: #ff9416;
		isolation: isolate;
		overflow: hidden;
		color: white;

		/* Adjust this to push the mobile image up or down (e.g., 0px, 10vh, -20px) */
		--mobile-hero-img-pos: 215px;
	}

	.hero-photo {
		position: absolute;
		inset: 0;
		pointer-events: none;
		display: block;
	}
	.hero-photo :global(img) {
		position: absolute;
		/* Fill the full hero height; width scales to keep aspect ratio.
		   Anchored to the right so the megaphone protester always shows;
		   the left side is cropped on narrower viewports. */
		right: 0;
		bottom: 0;
		height: 100%;
		width: auto;
		max-width: none;
		mix-blend-mode: soft-light;
	}

	@media (min-width: 851px) {
		.hero-photo :global(img) {
			mask-image: linear-gradient(to right, transparent, black 18%);
		}
	}

	@media (max-width: 850px) {
		.hero-photo :global(img) {
			/* On phones the image cropping becomes too aggressive when forced
			   to fill the height — use the original bottom-anchored layout. */
			right: auto;
			left: 50%;
			height: auto;
			width: calc(var(--mobile-hero-width-scale, 1.4) * 100%);
			transform: translateX(-50%);
			bottom: var(--mobile-hero-img-pos, 0px);
			mask-image: linear-gradient(to top, transparent, black 20%);
		}
	}

	/* TOP — generic slogan, sits over the protest photo. */
	.hero-top {
		position: relative;
	}

	.hero-top-inner {
		position: relative;
		z-index: 1;
		padding-block: 10rem 3rem;
		padding-inline: clamp(1.5rem, 20vw, 18rem);
	}
	.hero-top-inner h1 {
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: clamp(2.5rem, 5.8vw, 5.5rem);
		line-height: 1.02;
		color: white;
		margin: 0;
		max-width: 16ch;
		letter-spacing: 0.005em;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.18);
	}
	.hero-top-inner h1 em {
		color: #111110;
		font-style: normal;
	}
	.hero-top-inner .hero-buttons {
		margin-top: 1.5rem;
	}

	/* BADGE — small pill marking the active campaign */
	.hero-badge {
		position: relative;
		z-index: 1;
		align-self: flex-start;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: #111110;
		color: white;
		font-family: var(--font-heading);
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		font-size: 0.75rem;
		padding: 0.5rem 0.875rem;
		border-radius: 999px;
	}
	.hero-badge-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #fe9414;
		flex-shrink: 0;
		animation: heroPulse 1.8s ease-in-out infinite;
	}
	@media (prefers-reduced-motion: reduce) {
		.hero-badge-dot {
			animation: none;
		}
	}
	@keyframes heroPulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.55;
			transform: scale(0.8);
		}
	}

	/* BOTTOM — current campaign content */
	.hero-bottom {
		position: relative;
		min-height: 360px;
	}
	.hero-bottom-inner {
		padding-block: 3rem 5rem;
		padding-inline: clamp(1.5rem, 20vw, 18rem);
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}
	.hero-bottom h2 {
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: clamp(2.25rem, 4.8vw, 4.375rem);
		line-height: 1.04;
		color: white;
		margin: 0;
		max-width: 17ch;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
	}
	.hero-bottom h2 em {
		color: #111110;
		font-style: normal;
	}
	.hero-copy {
		color: white;
		font-size: 1.0625rem;
		line-height: 1.55;
		max-width: 44rem;
		margin: 0;
		font-weight: 500;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
	}

	/* Buttons — match live-site look: solid fills, square, condensed bold. */
	.hero-buttons {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
	.hero-buttons :global(a) {
		font-family: var(--font-heading);
		font-weight: 700;
		letter-spacing: 0.06em;
		font-size: 0.875rem;
		text-transform: uppercase;
		padding: 0.875rem 1.375rem;
		border: 0;
		border-radius: 4px;
		text-decoration: none;
		display: inline-block;
		text-align: center;
		transition:
			background-color 0.15s,
			scale 0.1s;
		cursor: pointer;
	}
	.hero-buttons :global(a.btn-dark) {
		background: #111110;
		color: white;
	}
	.hero-buttons :global(a.btn-dark:hover) {
		background: #1a1916;
	}
	.hero-buttons :global(a.btn-light) {
		background: white;
		color: #111110;
	}
	.hero-buttons :global(a.btn-light:hover) {
		background: #f0ebe2;
	}
	.hero-buttons :global(a:active) {
		scale: 0.97;
	}

	@media (max-width: 850px) {
		.hero-top {
			min-height: 420px;
		}
		.hero-top-inner {
			padding: 14rem 1.5rem 2rem;
		}
		.hero-top-inner h1 {
			font-size: clamp(2rem, 9vw, 3rem);
			max-width: none;
		}

		.hero-bottom {
			min-height: 0;
		}
		.hero-bottom-inner {
			padding: 2rem 1.5rem 2.5rem;
		}
		.hero-bottom h2 {
			font-size: clamp(1.75rem, 8vw, 2.5rem);
			max-width: none;
		}
		.hero-copy {
			font-size: 1rem;
		}
	}
</style>
