<script lang="ts">
	import SupporterCard from '$components/WhoCard.svelte'
	import UnderlinedTitle from '$components/UnderlinedTitle.svelte'

	const label_id = 'articles-title'

	const supporters = [
		{
			name: 'Maxime Fournes',
			blurb: 'Co-fondateur',
			image: 'maxime.png',
			job: 'Chercheur IA'
		},
		{
			name: 'Gilles Bréda',
			blurb: 'Co-fondateur',
			image:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/AI_%28Artificial_Intelligence%29_Dog.jpg/640px-AI_%28Artificial_Intelligence%29_Dog.jpg',
			job: 'Musicien professionnel'
		},
		{
			name: 'Moïri',
			blurb: 'Référent Plateforme',
			image:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/AI_%28Artificial_Intelligence%29_Dog.jpg/640px-AI_%28Artificial_Intelligence%29_Dog.jpg',
			job: 'Ingénieur informatique'
		},
		{
			name: 'Pierre',
			blurb: 'Chercheur @ Meta',
			image:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/AI_%28Artificial_Intelligence%29_Dog.jpg/640px-AI_%28Artificial_Intelligence%29_Dog.jpg',
			job: 'Archéologue et forgeron'
		},
		{
			name: 'Shaïman Le Futurologue',
			blurb: 'Chercheur @ Meta',
			image:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/AI_%28Artificial_Intelligence%29_Dog.jpg/640px-AI_%28Artificial_Intelligence%29_Dog.jpg',
			job: 'Vidéaste, podcasteur...'
		}
	]

	const secondsPerLogo = 5
	$: animationDuration = secondsPerLogo * supporters.length
</script>

<section aria-labelledby={label_id}>
	<UnderlinedTitle id={label_id}>Qui sommes-nous ?</UnderlinedTitle>
	<div class="logos" style="--animation-duration: {animationDuration}s;">
		<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
		<div class="logo_items">
			{#each supporters as supporter}
				<SupporterCard
					name={supporter.name}
					blurb={supporter.blurb}
					image={supporter.image}
					url={supporter.url}
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
			grid-template-columns: repeat(3, 1fr);
		}
	}
	@media (min-width: 1280px) {
		.logo_items {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.logos:hover .logo_items {
		animation-play-state: paused;
	}
</style>
