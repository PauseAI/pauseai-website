<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import Mark from '$lib/components/Mark.svelte'
	import LeftCorner from '$lib/components/hero/LeftCorner.svelte'
	import RightCorner from '$lib/components/hero/RightCorner.svelte'
	const label_id = 'hero-title'
</script>

<section class="hero" aria-labelledby={label_id}>
	<div class="hero-overlay">
		<enhanced:img
			src="$lib/assets/hero_bg.jpg"
			alt="PauseAI protesters"
			class="hero-bg"
			sizes="min(1920px, 100vw)"
			fetchpriority="high"
			loading="eager"
		/>
	</div>
	<section class="hero-content">
		<h1 id={label_id}>
			Ne laissons pas l'IA nous{'\u00A0'}détruire, <br /><Mark>agissons maintenant</Mark>
		</h1>
		<p>
			Selon la majorité des experts, le développement rapide de l'intelligence artificielle présente
			un danger catastrophique pour l'humanité à très court terme, au potentiel plus dévastateur que
			la bombe atomique.
		</p>
		<p>Nous faisons face à la menace la plus urgente de notre histoire. Chaque jour compte.</p>
		<div class="buttons">
			<Button href="/agir">Agir</Button>
			<Button href="/agir" alt>Rejoindre</Button>
		</div>
	</section>

	<LeftCorner />
	<RightCorner />
</section>

<style>
	.hero {
		display: flex;
		height: calc(100dvh - 8.125rem);
		align-items: center;
		z-index: 0;
		margin-top: 1rem;
	}
	.hero-overlay {
		position: absolute;
		overflow: hidden;
		top: 0;
		left: 0;
		width: 100%;
		height: 100dvh;
		align-items: center;
		display: flex;
		z-index: -1;
	}
	.hero-content {
		color: #fff;
		text-align: left;
		width: 100%;
	}
	.hero-content h1 {
		font-size: 1.7rem;
	}
	.hero-bg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.hero-overlay::after {
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
	.buttons {
		display: flex;
		align-items: center;
		flex-direction: column;
		gap: 2rem;
		margin-top: 2rem;
	}
	@media (min-width: 480px) {
		.hero-content {
			max-width: 28rem;
		}
		.buttons {
			flex-direction: row;
		}
	}
	@media (min-width: 640px) {
		.hero-content {
			max-width: 36rem;
		}
		.hero-content h1 {
			font-size: 2.2rem;
		}
	}
	@media (min-width: 768px) {
		.hero-content {
			max-width: 40rem;
		}
		.hero-content h1 {
			font-size: 2.4rem;
		}
		.hero-content p {
			padding-right: 3rem;
		}
	}
	@media (min-width: 1024px) {
		.hero-content {
			max-width: 52rem;
		}
		.hero-content h1 {
			font-size: 3.2rem;
		}
		.hero-content p {
			padding-right: 6rem;
		}
	}
	@media (min-width: 1280px) {
		.hero-content {
			max-width: 57rem;
		}
		.hero-content h1 {
			font-size: 3.5rem;
		}
		.hero-content p {
			padding-right: 6rem;
		}
	}
</style>
