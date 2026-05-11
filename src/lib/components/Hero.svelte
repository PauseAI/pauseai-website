<script lang="ts">
	import homeHeroDesktop from '$assets/protests/Home Hero - web - No Background.png?enhanced'
	import homeHeroMobile from '$assets/protests/Home Hero - mobile - No Background.png?enhanced'

	import Link from '$lib/components/Link.svelte'

	// Current campaign. Update this block when the active campaign changes.
	const campaign = {
		label: 'Active campaign — May 2026',
		title: '“AI is not just coming for your job”',
		aboutHref: '/action',
		description:
			'Workers, parents and patients are feeling it first. Add your story to the public record and help us hold the labs accountable.',
		primary: { href: 'https://tally.so/r/GxBRr2', label: 'Share your story' },
		secondary: { href: '/proposal', label: 'Read the brief' }
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

	<div class="hero-band">
		<div class="band-left">
			<span class="band-dot" aria-hidden="true"></span>
			<span class="band-label">{campaign.label}</span>
			<span class="band-title">{campaign.title}</span>
		</div>
		<a href={campaign.aboutHref} class="band-link">About this campaign →</a>
	</div>

	<div class="hero-bottom">
		<div class="hero-bottom-inner">
			<h2>AI is not <em>just</em> coming for your job.</h2>
			<p class="hero-copy">{campaign.description}</p>
			<div class="hero-buttons">
				<Link href={campaign.primary.href} class="btn-dark">{campaign.primary.label}</Link>
				<Link href={campaign.secondary.href} class="btn-light">{campaign.secondary.label}</Link>
			</div>
		</div>
	</div>
</div>

<style>
	.hero {
		position: relative;
		width: 100vw;
		left: 50%;
		transform: translateX(-50%);
		background-color: #ff9416;
		isolation: isolate;
		color: white;

		/* Desktop hero image aspect ratio (2880 / 1600) — update if image changes */
		--hero-img-ar: 1.8;
		/* Adjust this to push the mobile image up or down (e.g., 0px, 10vh, -20px) */
		--mobile-hero-img-pos: 215px;
	}

	/* Full-hero protest photo — covers top + bottom sections behind the band.
	   Soft-light blend tints the photo with the orange hero background.
	   No z-index on the wrapper so the blend can reach the orange below;
	   `isolation: isolate` on .hero keeps the blend scoped to the hero. */
	.hero {
		overflow: hidden;
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
			-webkit-mask-image: linear-gradient(to right, transparent, black 18%);
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
			-webkit-mask-image: linear-gradient(to top, transparent, black 20%);
			mask-image: linear-gradient(to top, transparent, black 20%);
		}
	}

	/* TOP — generic slogan, sits over the shared photo. */
	.hero-top {
		position: relative;
	}

	.hero-top-inner {
		position: relative;
		z-index: 1;
		padding: 13rem clamp(1.5rem, 4vw, 3.5rem) 2.75rem;
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

	/* BAND — current campaign label */
	.hero-band {
		position: relative;
		z-index: 2;
		background: #111110;
		color: white;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		padding: 1rem clamp(1.5rem, 4vw, 3.5rem);
		flex-wrap: wrap;
	}
	.band-left {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.band-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #fe9414;
		flex-shrink: 0;
		animation: heroPulse 1.8s ease-in-out infinite;
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
	.band-label {
		font-family: var(--font-heading);
		font-weight: 700;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		font-size: 0.8125rem;
		color: #fe9414;
	}
	.band-title {
		font-family: var(--font-heading);
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		font-size: 1.125rem;
		color: white;
	}
	.band-link {
		font-family: var(--font-heading);
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		font-size: 0.8125rem;
		color: white;
		opacity: 0.75;
		text-decoration: none;
		transition: opacity 0.15s;
	}
	.band-link:hover {
		opacity: 1;
	}

	/* BOTTOM — current campaign content */
	.hero-bottom {
		position: relative;
		min-height: 360px;
	}
	.hero-bottom-inner {
		padding: 3.25rem clamp(1.5rem, 4vw, 3.5rem) 4rem;
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

		.hero-band {
			padding: 0.875rem 1.5rem;
			gap: 0.75rem;
		}
		.band-label {
			font-size: 0.75rem;
		}
		.band-title {
			font-size: 0.95rem;
		}
		.band-link {
			display: none;
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
