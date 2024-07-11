<script>
	import SupporterCard from '$lib/components/SupporterCard.svelte'
	import Button from '$lib/components/Button.svelte'
	import UnderlinedTitle from '../UnderlinedTitle.svelte'

	const label_id = 'articles-title'
</script>

<section aria-labelledby={label_id}>
	<UnderlinedTitle id={label_id}>Nos soutiens</UnderlinedTitle>
	<div class="logos">
		<div class="logo_items">
			<SupporterCard
				name="Yann LeCan"
				blurb="Chercheur @ Meta"
				image="https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/AI_%28Artificial_Intelligence%29_Dog.jpg/640px-AI_%28Artificial_Intelligence%29_Dog.jpg"
				url="/risks"
			/>
			<SupporterCard
				name="Yann LeCan"
				blurb="Chercheur @ Meta"
				image="https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/AI_%28Artificial_Intelligence%29_Dog.jpg/640px-AI_%28Artificial_Intelligence%29_Dog.jpg"
				url="/risks"
			/>
			<SupporterCard
				name="Yann LeCan"
				blurb="Chercheur @ Meta"
				image="https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/AI_%28Artificial_Intelligence%29_Dog.jpg/640px-AI_%28Artificial_Intelligence%29_Dog.jpg"
				url="/risks"
			/>
			<SupporterCard
				name="Yann LeCan"
				blurb="Chercheur @ Meta"
				image="https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/AI_%28Artificial_Intelligence%29_Dog.jpg/640px-AI_%28Artificial_Intelligence%29_Dog.jpg"
				url="/risks"
			/>
			<SupporterCard
				name="Yann LeCan"
				blurb="Chercheur @ Meta"
				image="https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/AI_%28Artificial_Intelligence%29_Dog.jpg/640px-AI_%28Artificial_Intelligence%29_Dog.jpg"
				url="/risks"
			/>
		</div>
		<div class="logo_items">
			<SupporterCard
				name="Yann LeCan"
				blurb="Chercheur @ Meta"
				image="https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/AI_%28Artificial_Intelligence%29_Dog.jpg/640px-AI_%28Artificial_Intelligence%29_Dog.jpg"
				url="/risks"
			/>
			<SupporterCard
				name="Yann LeCan"
				blurb="Chercheur @ Meta"
				image="https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/AI_%28Artificial_Intelligence%29_Dog.jpg/640px-AI_%28Artificial_Intelligence%29_Dog.jpg"
				url="/risks"
			/>
			<SupporterCard
				name="Yann LeCan"
				blurb="Chercheur @ Meta"
				image="https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/AI_%28Artificial_Intelligence%29_Dog.jpg/640px-AI_%28Artificial_Intelligence%29_Dog.jpg"
				url="/risks"
			/>
			<SupporterCard
				name="Yann LeCan"
				blurb="Chercheur @ Meta"
				image="https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/AI_%28Artificial_Intelligence%29_Dog.jpg/640px-AI_%28Artificial_Intelligence%29_Dog.jpg"
				url="/risks"
			/>
			<SupporterCard
				name="Yann LeCan"
				blurb="Chercheur @ Meta"
				image="https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/AI_%28Artificial_Intelligence%29_Dog.jpg/640px-AI_%28Artificial_Intelligence%29_Dog.jpg"
				url="/risks"
			/>
		</div>
	</div>
</section>

<style>
	.articles-grid {
		display: flex;
		gap: 1rem;

		position: relative;
		overflow: hidden;
	}
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
		animation: 25s slides infinite linear;
	}

	.logos:hover .logo_items {
		animation-play-state: paused;
	}
</style>
