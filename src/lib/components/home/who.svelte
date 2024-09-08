<script lang="ts">
	import SupporterCard from '$components/WhoCard.svelte'
	import UnderlinedTitle from '$components/UnderlinedTitle.svelte'
	import FAQ from '$posts/qui-sommes-nous.md'

	const label_id = 'who-title'

	const supporters = [
		{
			name: 'Maxime Fournes',
			blurb: 'Co-fondateur',
			image: 'membres/maxime.png',
			job: 'Chercheur IA'
		},
		{
			name: 'Gilles Bréda',
			blurb: 'Co-fondateur',
			image: 'membres/gilles.jpg',
			job: 'Musicien professionnel'
		},
		{
			name: 'Moïri',
			blurb: 'Référent Plateforme',
			image: 'membres/moiri.jpeg',
			job: 'Ingénieur informatique'
		},
		{
			name: 'Pierre',
			blurb: 'Référent Rédaction',
			image: 'membres/pierre.png',
			job: 'Archéologue et forgeron'
		},
		{
			name: 'Shaïman',
			blurb: 'Volontaire',
			image: 'membres/shaiman.png',
			job: 'Vidéaste et podcasteur sur les enjeux de l’intelligence artificielle'
		},
		{
			name: 'Salim',
			blurb: 'Volontaire',
			image: 'membres/salim.jpg',
			job: 'Etudiant en mathématiques'
		}
	]

	const secondsPerLogo = 5
	$: animationDuration = secondsPerLogo * supporters.length
</script>

<section aria-labelledby={label_id}>
	<UnderlinedTitle id={label_id}>Qui sommes-nous ?</UnderlinedTitle>
	<FAQ />
	<div class="logos" style="--animation-duration: {animationDuration}s;">
		<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
		<div class="logo_items">
			{#each supporters as supporter}
				<SupporterCard
					name={supporter.name}
					blurb={supporter.blurb}
					image={supporter.image}
					job={supporter.job}
				/>
			{/each}
		</div>
	</div>
</section>

<style>
	@keyframes slides {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(calc(-100% - 1rem));
		}
	}

	.logos {
		display: flex;
		gap: 1rem;
	}

	.logo_items {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: 2rem;
	}

	@media (min-width: 600px) {
		.logo_items {
			grid-template-columns: repeat(1, 1fr);
		}
	}
	@media (min-width: 768px) {
		.logo_items {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (min-width: 1024px) {
		.logo_items {
			grid-template-columns: repeat(4, 1fr);
		}
	}
	@media (min-width: 1280px) {
		.logo_items {
			grid-template-columns: repeat(5, 1fr);
		}
	}

	.logos:hover .logo_items {
		animation-play-state: paused;
	}
</style>
