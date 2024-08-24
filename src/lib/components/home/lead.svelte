<script lang="ts">
	import UnderlinedTitle from '$components/UnderlinedTitle.svelte'
	import { fade } from 'svelte/transition';
	import { inview } from 'svelte-inview';

	let isInView;
	let textIsInView;

	const label_id = 'lead-title'
</script>

<section class="lead" aria-labelledby={label_id}
  use:inview={{ unobserveOnEnter: true, rootMargin: '-20%' }}
  on:change={({ detail }) => {
    isInView = detail.inView;
  }}>
    <div class={isInView ? 'visible' : 'hidden'}>
		<UnderlinedTitle id={label_id}
			>L’avènement de l’intelligence artificielle{'\u00A0'}: un défi sans précédent pour l’humanité
		</UnderlinedTitle>
	</div>
	<div class={"lead " + (textIsInView ? 'visible' : 'hidden')} aria-labelledby={label_id}
  use:inview={{ unobserveOnEnter: true, rootMargin: '-50%' }}
  on:change={({ detail }) => {
    textIsInView = detail.inView;
  }}>
		<p>
			Le développement d’intelligences artificielles progresse à une vitesse fulgurante{'\u00A0'}: en
			2020, elles peinaient à compter jusqu’à dix{'\u00A0'}; aujourd’hui, elles surpassent déjà les
			capacités humaines dans de nombreux domaines. Bien que l'IA promette des avancées positives
			potentielles, le revers de la médaille est terrifiant. D'après les experts en sécurité et
			éthique de l’IA, un développement incontrôlé promet également un assortiment de calamités{'\u00A0'}:
			désinformation à grande échelle, manipulation de masse, cyberattaques dévastatrices, pandémies
			artificielles, et perte de contrôle de systèmes autonomes, allant jusqu’à menacer la survie même
			de l'humanité.
		</p>
		<p>
			Pause IA, porte-parole des chercheurs en sécurité de l'IA, promeut un développement responsable de
			cette technologie en pleine expansion. Nous appelons à un moratoire sur l'entraînement de
			systèmes plus dangereux, afin d'éviter une catastrophe mondiale.
		</p>
		<p>
			Les dangers sont réels, mais l'espoir existe. En agissant ensemble, nous pouvons façonner un
			futur où l'IA demeure un outil bénéfique pour l'humanité.
		</p>
		<p>
			<a href="/dangers">Informez-vous.</a>
			<a href="/nous-rejoindre">Rejoignez-nous.</a>
			<a href="/agir">Passez à l’action.</a>
		</p>
	</div>
</section>

<style>
	.lead {
		align-self: center;
		max-width: 60rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.hidden {
		opacity: 0;
	}

	.visible {
		animation: fadeIn 0.5s ease-in-out forwards;
		animation-delay: 0s;
	}

	@keyframes fadeIn {
	  0% { opacity: 0; transform: translateY(60px); }
	  100% { opacity: 1; transform: translateY(0); }
	}
</style>
