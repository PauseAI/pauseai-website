<script lang="ts">
	import SupporterCard from '$components/SupporterCard.svelte'
	import UnderlinedTitle from '$components/UnderlinedTitle.svelte'

	const label_id = 'articles-title'

	const supporters = [
		{
			name: 'Yann LeCan1',
			blurb: 'Chercheur @ Meta',
			image:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/AI_%28Artificial_Intelligence%29_Dog.jpg/640px-AI_%28Artificial_Intelligence%29_Dog.jpg',
			url: '/risks'
		},
		{
			name: 'Yann LeCan2',
			blurb: 'Chercheur @ Meta',
			image:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/AI_%28Artificial_Intelligence%29_Dog.jpg/640px-AI_%28Artificial_Intelligence%29_Dog.jpg',
			url: '/risks'
		},
		{
			name: 'Yann LeCan3',
			blurb: 'Chercheur @ Meta',
			image:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/AI_%28Artificial_Intelligence%29_Dog.jpg/640px-AI_%28Artificial_Intelligence%29_Dog.jpg',
			url: '/risks'
		},
		{
			name: 'Yann LeCan4',
			blurb: 'Chercheur @ Meta',
			image:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/AI_%28Artificial_Intelligence%29_Dog.jpg/640px-AI_%28Artificial_Intelligence%29_Dog.jpg',
			url: '/risks'
		},
		{
			name: 'Yann LeCan5',
			blurb: 'Chercheur @ Meta',
			image:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/AI_%28Artificial_Intelligence%29_Dog.jpg/640px-AI_%28Artificial_Intelligence%29_Dog.jpg',
			url: '/risks'
		}
	]

	const secondsPerLogo = 5
	$: animationDuration = secondsPerLogo * supporters.length
</script>

<section aria-labelledby={label_id}>
	<UnderlinedTitle id={label_id}>Nos soutiens</UnderlinedTitle>
	<div class="logos" style="--animation-duration: {animationDuration}s;">
		<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
		{#each Array(2) as _}
			<div class="logo_items">
				{#each supporters as supporter}
					<SupporterCard
						name={supporter.name}
						blurb={supporter.blurb}
						image={supporter.image}
						url={supporter.url}
					/>
				{/each}
			</div>
		{/each}
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
		overflow: hidden;
		white-space: nowrap;
		position: relative;
		display: flex;
		gap: 1rem;
		margin-left: -1rem;
		margin-right: -1rem;
	}
	@media (min-width: 640px) {
		.logos {
			margin-left: -2rem;
			margin-right: -2rem;
		}
	}

	@media (min-width: 768px) {
		.logos {
			margin-left: -4rem;
			margin-right: -4rem;
		}
	}
	@media (min-width: 1024px) {
		.logos {
			margin-left: -6rem;
			margin-right: -6rem;
		}
	}

	.logo_items {
		display: flex;
		gap: 1rem;
		animation: slides infinite linear;
		animation-duration: var(--animation-duration, 25s); /* fallback duration */
	}

	.logos:hover .logo_items {
		animation-play-state: paused;
	}
</style>
