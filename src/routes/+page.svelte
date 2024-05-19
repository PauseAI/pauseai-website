<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import Mark from '$lib/components/Mark.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import LeftCorner from '$lib/components/hero/LeftCorner.svelte'
	import RightCorner from '$lib/components/hero/RightCorner.svelte'
	import Accordion from '$lib/components/Accordion.svelte'

	const title = 'We need to Pause AI'
	const description = 'We are risking human extinction. We need to pause AI development, right now.'
</script>

<PostMeta {title} {description} />
<section class="hero">
	<section class="hero-content">
		<h1>Ne laissons pas les entreprises IA jouer avec <Mark>notre futur</Mark></h1>
		<p>
			Nous sommes une communauté de bénévoles à but non lucratif qui se concentre sur l'atténuation
			des risques liés à l'IA et qui exhorte les gouvernements à faire une pause dans le
			développement de l'IA surhumaine. Par le biais de l'éducation publique, de la défense des
			droits et de manifestations pacifiques, nous visons à sensibiliser le public. Nous ne sommes
			pas affiliés à des entreprises.
		</p>
		<Button href="/action">Agir</Button>
	</section>
	<enhanced:img
		src="$lib/assets/hero_bg.jpg"
		alt="PauseAI protesters"
		class="hero-bg"
		sizes="min(1920px, 100vw)"
		fetchpriority="high"
		loading="eager"
	/>
	<LeftCorner />
	<RightCorner />
</section>

<section class="lead">
	<h2>L'intelligence artificielle est un danger pour l'humanité</h2>
	<p>
		L'IA est une technologie puissante qui transforme de plus en plus notre monde. Elle est porteuse
		d'un potentiel extraordinaire, mais aussi de risques graves, notamment de catastrophes
		existentielles. Nous voulons marquer une pause dans le développement de systèmes d'IA plus
		puissants que GPT-4, jusqu'à ce que nous sachions comment les construire en toute sécurité et
		les garder sous contrôle démocratique.
	</p>
</section>

<section class="faq">
	<h2>F.A.Q.</h2>
	<Accordion id="accordion1">
		<svelte:fragment slot="head">Êtes-vous contre la technologie ?</svelte:fragment>
		<svelte:fragment slot="details">
			<p>
				In 2020, experts thought we had more than 35 years until AGI. Recent breakthroughs show we
				might be almost there. Superintelligence could be one innovation away, so we should tread
				carefully. In 2020, experts thought we had more than 35 years until AGI. Recent
				breakthroughs show we might be almost there. Superintelligence could be one innovation away,
				so we should tread carefully.
			</p>
		</svelte:fragment>
	</Accordion>
	<Accordion id="accordion2">
		<svelte:fragment slot="head">
			Pensez-vous vraiment que le développement de l’IA peut être mise en pause ?
		</svelte:fragment>
		<svelte:fragment slot="details">
			<p>
				In 2020, experts thought we had more than 35 years until AGI. Recent breakthroughs show we
				might be almost there. Superintelligence could be one innovation away, so we should tread
				carefully. In 2020, experts thought we had more than 35 years until AGI. Recent
				breakthroughs show we might be almost there. Superintelligence could be one innovation away,
				so we should tread carefully.
			</p>
		</svelte:fragment>
	</Accordion>
</section>

<style>
	.hero + section {
		margin-top: 100vh;
	}
	.hero {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		align-items: center;
		display: flex;
	}
	.hero-content {
		color: #fff;
		text-align: left;
		width: 60rem;
		padding: 6rem;
		z-index: 1;
	}
	.hero-content p {
		width: 45rem;
		margin: 2rem 0;
	}
	.hero-bg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.hero::after {
		content: '';
		position: absolute;
		width: 100%;
		height: 100%;
		background: 
		/* Permalink - use to edit and share this gradient: https://colorzilla.com/gradient-editor/#000000+0,000000+27,1b1b1b+49,1e1e1e+49,1d1d1d+49,232323+50,212121+51,242424+51,262626+53,282828+53,292929+56,2b2b2b+56,292929+62,272727+62,252525+66,1c1c1c+71,1c1c1c+77,1a1a1a+78,181818+82,161616+84,141414+84,151515+85,101010+86,0f0f0f+87,090909+88,030303+90,0d0d0d+91,010101+91,010101+100&0.76+0,0.76+27,0.56+49,0.55+60,0.59+71,0.48+90,0.48+100 */
			linear-gradient(
			to right,
			rgba(0, 0, 0, 0.76) 0%,
			rgba(0, 0, 0, 0.76) 27%,
			rgba(29, 29, 29, 0.56) 49%,
			rgba(35, 35, 35, 0.56) 50%,
			rgba(36, 36, 36, 0.56) 51%,
			rgba(40, 40, 40, 0.56) 53%,
			rgba(43, 43, 43, 0.56) 56%,
			rgba(40, 40, 40, 0.55) 60%,
			rgba(39, 39, 39, 0.56) 62%,
			rgba(37, 37, 37, 0.57) 66%,
			rgba(28, 28, 28, 0.59) 71%,
			rgba(28, 28, 28, 0.56) 77%,
			rgba(26, 26, 26, 0.55) 78%,
			rgba(24, 24, 24, 0.53) 82%,
			rgba(20, 20, 20, 0.52) 84%,
			rgba(21, 21, 21, 0.51) 85%,
			rgba(16, 16, 16, 0.5) 86%,
			rgba(15, 15, 15, 0.5) 87%,
			rgba(9, 9, 9, 0.49) 88%,
			rgba(3, 3, 3, 0.48) 90%,
			rgba(1, 1, 1, 0.48) 91%,
			rgba(1, 1, 1, 0.48) 100%
		);
	}
	.lead {
		align-self: center;
		width: 60rem;
	}
	.lead h2 {
		margin-left: 4rem;
	}
	section + section {
		margin-top: 16rem;
	}
</style>
