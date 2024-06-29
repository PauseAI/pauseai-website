<script>
	import UnderlinedTitle from '../UnderlinedTitle.svelte'

	const label_id = 'lead-title'
</script>

<section class="lead" aria-labelledby={label_id}>
	<UnderlinedTitle id={label_id}
		>L'intelligence artificielle est un danger pour l'humanité</UnderlinedTitle
	>
	<p>
		L'IA est une technologie puissante qui transforme de plus en plus notre monde. Elle est porteuse
		d'un potentiel extraordinaire, mais aussi de risques graves, notamment de catastrophes
		existentielles. Nous voulons marquer une pause dans le développement de systèmes d'IA plus
		puissants que GPT-4, jusqu'à ce que nous sachions comment les construire en toute sécurité et
		les garder sous contrôle démocratique.
	</p>
</section>

<style>
	.lead {
		align-self: center;
		max-width: 60rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* @media (min-width: 640px) {
		.lead h2 {
			font-size: 1.4rem;
		}
	} */
	@media (min-width: 1024px) {
		.lead h2 {
			font-size: 2rem;
		}
	}
</style>
