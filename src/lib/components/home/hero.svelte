<script lang="ts">
	import Button from '$components/Button.svelte'
	import Mark from '$components/Mark.svelte'
	import LeftCorner from '$components/hero/LeftCorner.svelte'
	import RightCorner from '$components/hero/RightCorner.svelte'
	const label_id = 'hero-title'
</script>

<section class="hero" aria-labelledby={label_id}>
	<div class="overlay">
		<enhanced:img
			src="$assets/hero_bg.jpg"
			alt="PauseAI protesters"
			class="background"
			sizes="min(1920px, 100vw)"
			fetchpriority="high"
			loading="eager"
		/>
	</div>
	<section class="content">
		<h1 id={label_id}>
			Ne laissons pas l'IA nous{'\u00A0'}détruire, <br /><Mark>agissons maintenant</Mark>
		</h1>
		<div class="description">
			<p>
				Selon la majorité des experts, le développement rapide de l'intelligence artificielle présente
				un danger catastrophique pour l'humanité à très court terme, au potentiel plus dévastateur que
				la bombe atomique.
			</p>
			<p>Nous faisons face à la menace la plus urgente de notre histoire. Chaque jour compte.</p>
			<div class="buttons">
				<Button href="/agir">Agir</Button>
				<Button href="/nous-rejoindre" alt>Rejoindre</Button>
			</div>
		</div>
	</section>
	<div class="corners">
		<LeftCorner />
		<RightCorner />
	</div>
</section>

<style>
	.hero {
		--hero-top-offset: -7.125rem;
		display: flex;
		min-height: calc(100svh + var(--hero-top-offset));
		align-items: center;
		z-index: 0;
		position: relative;
	}
	.overlay {
		position: absolute;
		overflow: hidden;
		top: var(--hero-top-offset);
		left: 50%;
		transform: translateX(-50%);
		width: 100vw;
		height: calc(100% - var(--hero-top-offset));
		align-items: center;
		display: flex;
		z-index: -1;
	}
	.content {
		color: #fff;
		display: flex;
		flex-direction: column;
		justify-content: center;
		max-width: 100%;
	}
	.content h1 {
		font-size: 1.6rem;
	}
	/* Ensures that the description is constrained by the width of h1 */
	.description {
		width: 0;
		min-width: 100%;
	}
	.background {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.corners {
		width: 100vw;
		bottom: -1px;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		border-bottom: 1px solid white;
	}
	.overlay::after {
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
		.buttons {
			flex-direction: row;
		}
	}
	@media (min-width: 640px) {
		.hero {
			--hero-top-offset: -8.125rem;
		}
		.content h1 {
			font-size: 2.1rem;
		}
	}
	@media (min-width: 768px) {
		.content h1 {
			font-size: 2.4rem;
		}
	}
	@media (min-width: 1024px) {
		.content h1 {
			font-size: 3rem;
		}
	}
	@media (min-width: 1280px) {
		.content h1 {
			font-size: 3.5rem;
		}
	}
</style>
