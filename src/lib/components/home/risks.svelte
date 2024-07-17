<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import TabList from '$lib/components/TabList.svelte'
	import UnderlinedTitle from '$lib/components/UnderlinedTitle.svelte'

	const label_id = 'risks-title'
</script>

<section aria-labelledby={label_id}>
	<UnderlinedTitle id={label_id}>Les dangers</UnderlinedTitle>
	<TabList
		tabs={['Économiques et matériels', 'Pour les individus', 'Pour la société', 'Pour l’humanité']}
		id="risks-tabs"
		let:tab
		{label_id}
	>
		{tab}
		<svelte:fragment slot="panel" let:tab>
			{#if tab === 'Économiques et matériels'}
				<p>
					Maman, quand je serai grand, je serai… inutile ? Les laboratoires d'IA ont pour projet
					d'automatiser la totalité du travail humain d'ici 4 ans. Qu'ils atteignent pleinement cet
					objectif ou non, il est évident que nous nous dirigeons vers un bouleversement majeur du
					marché du travail. Nous devons nous préparer à affronter un choc économique sans
					précédent.
				</p>
				<p>
					Les dangers économiques et matériels liés aux intelligences artificielles menacent
					directement nos infrastructures, nos entreprises et nos ressources. Cette technologie
					introduit des vulnérabilités inédites et des possibilités de dysfonctionnements
					catastrophiques. Imaginez des attaques dévastatrices facilitées par l'IA, ou
					l'effondrement de secteurs entiers face à ces technologies de rupture. Ces dangers, bien
					que moins visibles que ceux menaçant directement les vies humaines, peuvent avoir des
					conséquences tout aussi massives.
				</p>
				<p>
					Nous devons faire preuve d’une vigilance accrue et mettre en place des régulations
					rigoureuses pour nous protéger.
				</p>
				<Button href="/dangers/economiques-et-materiels">En apprendre davantage</Button>
			{:else if tab === 'Pour les individus'}
				<p>
					Imaginez-vous sur une application de rencontre, échangeant des messages avec ce qui semble
					être la personne parfaite. Mais êtes-vous vraiment en train de discuter avec un être
					humain ? Aujourd'hui, la réponse peut sembler évidente, car les bots sont parfois
					maladroits. Mais cette réalité est sur le point de changer radicalement. La technologie
					permettant de créer des conversations indiscernables d'interactions humaines existe déjà,
					comme le démontrent les récents tests de Turing réussis. Elle pourrait être largement
					déployée et rendre impossible la distinction entre une conversation avec un humain de
					celle avec une IA. Cette technologie n'est pas un concept futuriste lointain ; elle existe
					déjà et est en cours d'implémentation dans de nombreux domaines de notre vie numérique.
				</p>
				<p>
					Cette évolution rapide révèle à quel point l’IA s’immisce dans notre quotidien, menaçant
					notre intimité, notre sécurité et notre bien-être. Chaque jour, nous risquons de voir
					notre vie privée violée et nos opinions manipulées par la désinformation. Les conséquences
					peuvent être dévastatrices, tant sur le plan émotionnel que physique. Pour nous protéger,
					il est crucial de mettre en place des cadres réglementaires solides, d’éduquer le public
					et d’intégrer des gardes-fous dans les intelligences artificielles.
				</p>
				<Button href="/dangers/pour-les-individus">En apprendre davantage</Button>
			{:else if tab === 'Pour la société'}
				<p>
					Dans un avenir proche, peut-être d'ici deux ans seulement, les intelligences artificielles
					seront capables de concevoir des virus plus mortels que tout ce que nous connaissons
					aujourd'hui. Le bioterrorisme assisté par l'IA n'est qu'un exemple des menaces émergentes.
					Parallèlement, le risque de cyberattaques dévastatrices, orchestrées ou amplifiées par des
					IA sophistiquées, plane sur nos infrastructures critiques et nos systèmes de
					communication.
				</p>
				<p>
					Ces scénarios ne sont que la partie visible d'un danger bien plus large : l'IA menace le
					cœur même de notre société. Elle touche à la cohésion sociale et aux fondements de notre
					démocratie. Nos processus démocratiques sont fragilisés par la polarisation et la
					désinformation. Les biais raciaux s'exacerbent, l’automatisation des emplois se profile,
					et l'ombre de nouvelles formes de guerre et de terrorisme plane sur nous. Ces dangers
					peuvent détruire nos valeurs et nos structures sociales.
				</p>
				<p>
					Pour les contrer, nous devons urgemment mettre en place une régulation proactive, repenser
					nos systèmes d'information et promouvoir la pensée critique.
				</p>
				<Button href="/dangers/pour-la-societe">En apprendre davantage</Button>
			{:else if tab === 'Pour l’humanité'}
				<p>
					L'IA représente la plus grande menace jamais connue pour le futur de l'humanité. OpenAI,
					DeepMind, Anthropic et d'autres géants technologiques investissent des milliards de
					dollars dans la création d'une IA aux capacités quasi divines. Leurs dirigeants affirment
					qu'ils pourraient réussir dans les prochaines années. Or, ils admettent ne pas savoir
					comment contrôler leur création et reconnaissent que l'humanité pourrait s'éteindre à
					cause de celle-ci.
				</p>
				<p>
					La perte de contrôle des intelligences artificielles ou leur désalignement sont des
					dangers qui ne peuvent pas forcément être observés, et il est peu probable que nous aurons
					des sirènes d’alarme plus claires qu’aujourd’hui avant qu’il ne soit trop tard. Le
					potentiel extraordinaire de l'IA générale pourrait se révéler apocalyptique. Notre seul
					espoir réside en une pause qui favorise la recherche en alignement technique.
				</p>
				<Button href="/dangers/pour-l'humanite">En apprendre davantage</Button>
			{/if}
		</svelte:fragment>
	</TabList>
</section>
