<script lang="ts">
	import heroPhoto from '$assets/protests/Home Hero - London June 2025.jpg?enhanced'

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
	<!-- SLOGAN — the movement's permanent identity, over a full-bleed protest photo. -->
	<section class="slogan">
		<picture class="slogan-photo">
			{#each Object.entries(heroPhoto.sources) as [format, srcset]}
				<source {srcset} sizes="100vw" type={'image/' + format} />
			{/each}
			<img src={heroPhoto.img.src} alt="" fetchpriority="high" />
		</picture>
		<div class="slogan-scrim" aria-hidden="true"></div>

		<div class="slogan-inner">
			<h1>Join the movement to <em>Pause</em> AI.</h1>
			<div class="hero-buttons">
				<Link href="/join" class="btn-primary">Get involved</Link>
				<Link href="/donate" class="btn-on-photo">Donate</Link>
			</div>
		</div>
	</section>

	<!-- CAMPAIGN — the active campaign, on a clean light band so it reads as distinct & current. -->
	<section class="campaign">
		<div class="campaign-inner">
			<span class="campaign-eyebrow">Current campaign</span>
			<h2>AI is not <em>just</em> coming for your job.</h2>
			<p class="campaign-copy">{campaign.description}</p>
			<div class="hero-buttons">
				<Link href={campaign.primary.href} class="btn-primary">{campaign.primary.label}</Link>
				{#if campaign.secondary}
					<Link href={campaign.secondary.href} class="btn-outline">{campaign.secondary.label}</Link>
				{/if}
			</div>
		</div>
	</section>
</div>

<style>
	.hero {
		position: relative;
		width: 100vw;
		flex: 1;
		left: 50%;
		transform: translateX(-50%);
		isolation: isolate;
		display: flex;
		flex-direction: column;
	}

	/* ---------- SLOGAN ---------- */
	.slogan {
		position: relative;
		/* Slogan + campaign together fill the viewport; the slogan flexes to take
		   whatever height is left after the (compact) campaign band. The min-height
		   guarantees enough photo + headline room below the menu band (whose height,
		   --menu-orange, is set by the layout to match the actual nav height). */
		flex: 1;
		min-height: calc(var(--menu-orange, 142px) + 240px);
		overflow: hidden;
		/* Solid orange behind the menu (like the previous hero); the photo starts
		   on a clean edge just below it. */
		background-color: #ff9416;
		color: white;
	}

	.slogan-photo {
		position: absolute;
		inset: var(--menu-orange, 142px) 0 0 0;
		pointer-events: none;
		display: block;
	}
	.slogan-photo :global(img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: 50% 35%;
		display: block;
	}

	/* Dark scrim over the photo only (starts below the orange menu band).
	   Heavier on the top-left, where the headline sits; lighter on the right so the
	   crowd and the PAUSE AI banner stay visible. */
	.slogan-scrim {
		position: absolute;
		inset: var(--menu-orange, 142px) 0 0 0;
		background:
			linear-gradient(
				to bottom,
				rgba(0, 0, 0, 0.62) 0%,
				rgba(0, 0, 0, 0.12) 55%,
				rgba(0, 0, 0, 0.32) 100%
			),
			linear-gradient(to right, rgba(0, 0, 0, 0.62) 0%, rgba(0, 0, 0, 0.18) 60%, transparent 100%);
	}

	.slogan-inner {
		position: relative;
		z-index: 1;
		width: 100%;
		/* Top padding clears the orange menu band so the headline always sits
		   cleanly on the photo, on any screen height. */
		padding-block: calc(var(--menu-orange, 142px) + 1.75rem) 3rem;
		padding-inline: clamp(1.5rem, 20vw, 18rem);
	}
	.slogan-inner h1 {
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: clamp(2.5rem, 5.4vw, 5rem);
		line-height: 1;
		color: white;
		margin: 0 0 1.5rem;
		max-width: 16ch;
		letter-spacing: 0.005em;
		text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
	}
	.slogan-inner h1 em {
		color: var(--brand);
		font-style: normal;
	}

	/* ---------- CAMPAIGN ---------- */
	.campaign {
		position: relative;
		background: var(--bg);
		color: var(--text);
	}
	.campaign-inner {
		padding-block: 1.75rem 2.25rem;
		padding-inline: clamp(1.5rem, 20vw, 18rem);
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.875rem;
	}
	.campaign-eyebrow {
		display: inline-block;
		background: var(--brand);
		color: white;
		font-family: var(--font-heading);
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		font-size: 0.8125rem;
		padding: 0.4rem 0.75rem;
		border-radius: 4px;
	}
	.campaign h2 {
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: clamp(1.75rem, 3.6vw, 2.75rem);
		line-height: 1.04;
		color: var(--text);
		margin: 0;
		max-width: 18ch;
	}
	.campaign h2 em {
		color: var(--brand);
		font-style: normal;
	}
	.campaign-copy {
		color: var(--text);
		opacity: 0.8;
		font-size: 1rem;
		line-height: 1.5;
		max-width: 44rem;
		margin: 0;
		font-weight: 400;
	}

	/* ---------- BUTTONS ---------- */
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
		padding: 0.875rem 1.5rem;
		border: 2px solid transparent;
		border-radius: 4px;
		text-decoration: none;
		display: inline-block;
		text-align: center;
		transition:
			background-color 0.15s,
			color 0.15s,
			scale 0.1s;
		cursor: pointer;
	}
	.hero-buttons :global(a.btn-primary) {
		background: var(--brand);
		border-color: var(--brand);
		color: white;
	}
	.hero-buttons :global(a.btn-primary:hover) {
		background: var(--brand-dark);
		border-color: var(--brand-dark);
	}
	/* Secondary CTA over the photo — solid white reads clearly on the dark scrim. */
	.hero-buttons :global(a.btn-on-photo) {
		background: white;
		border-color: white;
		color: #111110;
	}
	.hero-buttons :global(a.btn-on-photo:hover) {
		background: #f0ebe2;
		border-color: #f0ebe2;
	}
	/* Secondary CTA on the light campaign band — outlined so it stays quiet. */
	.hero-buttons :global(a.btn-outline) {
		background: transparent;
		border-color: var(--text);
		color: var(--text);
	}
	.hero-buttons :global(a.btn-outline:hover) {
		background: var(--text);
		color: var(--bg);
	}
	.hero-buttons :global(a:active) {
		scale: 0.97;
	}

	/* ---------- RESPONSIVE ---------- */
	@media (max-width: 850px) {
		.slogan {
			min-height: calc(var(--menu-orange, 213px) + 200px);
		}
		.slogan-inner {
			padding: calc(var(--menu-orange, 213px) + 1.25rem) 1.5rem 2.25rem;
		}
		.slogan-inner h1 {
			font-size: clamp(2.25rem, 10vw, 3rem);
			max-width: none;
		}
		.campaign-inner {
			padding: 1.75rem 1.5rem 2.25rem;
		}
		.campaign h2 {
			font-size: clamp(1.6rem, 7.5vw, 2.25rem);
			max-width: none;
		}
	}
</style>
