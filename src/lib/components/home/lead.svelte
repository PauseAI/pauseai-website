<script lang="ts">
	import Button from '$components/Button.svelte'
	import Fly from '$components/Fly.svelte'
	import UnderlinedTitle from '$components/UnderlinedTitle.svelte'
	import { fly } from 'svelte/transition'

	const label_id = 'lead-title'
</script>

<section class="lead" aria-labelledby={label_id}>
	<Fly>
		<UnderlinedTitle id={label_id}
			>L’avènement de l’intelligence artificielle{'\u00A0'}: un défi sans précédent pour l’humanité
		</UnderlinedTitle>
	</Fly>
	<Fly>
		<div class="lead" aria-labelledby={label_id}>
			<p>
				Le développement d’intelligences artificielles <a href="https://arxiv.org/abs/2001.08361"
					>progresse à une vitesse fulgurante</a
				>{'\u00A0'}: en 2020, elles peinaient à compter jusqu’à dix{'\u00A0'}; aujourd’hui, elles
				surpassent déjà les capacités humaines dans de nombreux domaines. Bien que l'IA promette des
				avancées positives potentielles, le revers de la médaille est terrifiant.
			</p>
			<p>
				D'après <a href="https://www.safe.ai/work/statement-on-ai-risk#open-letter"
					>les experts en sécurité et éthique de l’IA</a
				>, un développement incontrôlé promet également un assortiment de calamités{'\u00A0'}:
				désinformation à grande échelle, manipulation de masse, cyberattaques dévastatrices,
				pandémies artificielles, et perte de contrôle de systèmes autonomes, allant jusqu’à menacer
				la survie même de l'humanité.
			</p>
			<p>
				Pause IA, porte-parole des chercheurs en sécurité de l'IA, promeut un développement
				responsable de cette technologie en pleine expansion. Nous appelons à un moratoire sur
				l'entraînement de systèmes plus dangereux, afin d'éviter une catastrophe mondiale.
			</p>
			<p>
				Les dangers sont réels, mais l'espoir existe. En agissant ensemble, nous pouvons façonner un
				futur où l'IA demeure un outil bénéfique pour l'humanité.
			</p>
			<div class="buttons" in:fly={{ y: 20, duration: 300, delay: 700 }}>
				<Button href="/dangers">Informez-vous</Button>
				<Button href="/nous-rejoindre">Rejoignez-nous</Button>
				<Button href="/agir">Passez à l’action</Button>
			</div>
		</div>
	</Fly>
</section>

<style>
	.lead {
		align-self: center;
		max-width: 60rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.buttons {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		margin-top: 2rem;
	}

	@media (min-width: 768px) {
		.buttons {
			flex-direction: row;
		}
	}
</style>
