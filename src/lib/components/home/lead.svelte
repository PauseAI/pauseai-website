<script>
	import UnderlinedTitle from '../UnderlinedTitle.svelte'

	const label_id = 'lead-title'
</script>

<section class="lead" aria-labelledby={label_id}>
	<UnderlinedTitle id={label_id}
		>L’intelligence artificielle : un défi sans précédent pour l’humanité.
	</UnderlinedTitle>
	<p>
		L'IA progresse à une vitesse fulgurante, surpassant déjà les capacités humaines dans de nombreux
		domaines. Bien que l'IA apporte actuellement certaines avancées positives, son développement
		incontrôlé présente des dangers majeurs{'\u00A0'}: bioterrorisme facilité, cyberattaques
		dévastatrices, manipulation de masse, désinformation à grande échelle, et perte de contrôle de
		systèmes autonomes ((pouvant mener à des risques existentiels)). Pause IA, porte-parole des
		chercheurs en sûreté de l'IA en France, promeut un développement responsable de cette
		technologie en pleine expansion. Nous reconnaissons ses bénéfices actuels, mais appelons à un
		moratoire sur l'entraînement de modèles plus performants, afin d'établir des garde-fous robustes
		nous assurant un avenir sûr. Les risques sont réels, mais l'espoir existe. En agissant ensemble,
		nous pouvons façonner un futur où l'IA demeure un outil bénéfique pour l'humanité.
		Impliquez-vous dans nos actions et soutenez nos démarches en rejoignant Pause IA. ((Prenez
		conscience de ces enjeux et rejoignez notre mouvement.))
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
