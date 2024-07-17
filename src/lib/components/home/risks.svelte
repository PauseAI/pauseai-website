<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import TabList from '$lib/components/TabList.svelte'
	import UnderlinedTitle from '$lib/components/UnderlinedTitle.svelte'

	const label_id = 'risks-title'
</script>

<section aria-labelledby={label_id}>
	<UnderlinedTitle id={label_id}>Les dangers</UnderlinedTitle>
	<TabList
		tabs={[
			'Dangers économiques et matériels',
			'Dangers pour les individus',
			'Dangers pour la société',
			'Dangers pour l’humanité'
		]}
		id="risks-tabs"
		let:tab
		{label_id}
	>
		{tab}
		<svelte:fragment slot="panel" let:tab>
			{#if tab === 'Dangers économiques et matériels'}
				<p>
					Les risques économiques et matériels liés à l'intelligence artificielle concernent
					principalement les impacts directs sur les infrastructures, les entreprises, et les
					ressources matérielles. Alors que l'IA promet des avancées significatives dans
					l'optimisation et l'automatisation des processus, elle introduit également des
					vulnérabilités nouvelles et des possibilités de dysfonctionnements. Ces risques
					comprennent la facilitation d’attaques à l’aide d’IA, les dysfonctionnements prosaïques et
					l’impact économique de technologies de rupture. Bien qu’il soit important de gérer les
					risques qui menacent des personnes humaines, ceux-ci ne sont pas non plus à négliger.
				</p>
				<p>
					La gestion de ces risques nécessite une vigilance accrue, des régulations rigoureuses et
					surtout des innovations technologiques pour garantir la résilience et la sécurité des
					systèmes d’IA et de systèmes confrontés à l’IA.
				</p>
				<Button href="/dangers/economiques-et-materiels">En apprendre davantage</Button>
			{:else if tab === 'Dangers pour les individus'}
				<p>
					L'intégration de l'IA dans la vie quotidienne pose des risques significatifs pour les
					individus, touchant à leur vie privée, leur sécurité et leur bien-être. Ces risques
					incluent la violation de la confidentialité, la désinformation et la manipulation, avec
					pour conséquence des dommages émotionnels ou physiques graves. Pour atténuer ces risques,
					il est crucial de mettre en place des cadres réglementaires robustes et des pratiques de
					sensibilisation et d'éducation auprès du public, ainsi que des gardes-fous intégrés aux
					systèmes d’IA.
				</p>
				<Button href="/dangers/pour-les-individus">En apprendre davantage</Button>
			{:else if tab === 'Dangers pour la société'}
				<p>
					Certains risques touchent la société entière, et doivent être considérés dans cette
					perspective afin de ne pas en négliger des aspects majeurs. Les risques pour la société
					liés à l'IA sont vastes et touchent directement à la cohésion sociale et aux fondements de
					la démocratie. Ces risques portent sur l'intégrité des processus démocratiques par
					l’affaiblissement, la polarisation et la désinformation, mais aussi sur les processus
					sociaux comme les biais raciaux ou l’automatisation du travail, ainsi que sur des
					problèmes plus directs comme la guerre et le terrorisme.
				</p>
				<p>
					Ces risques émergeant souvent d’un usage mal avisé des nouvelles technologies, une
					régulation proactive, une refonte des systèmes d'information et une éducation à la pensée
					critique sont les meilleures mesures afin de préserver nos valeurs et nos structures
					sociales.
				</p>
				<Button href="/dangers/pour-la-societe">En apprendre davantage</Button>
			{:else if tab === 'Dangers pour l’humanité'}
				<p>
					Plus spéculativement, l’IA pose des Dangers qui menacent durablement le futur de
					l’humanité. Ces risques ne peuvent pas forcément être observés, et il est peu probable que
					nous aurons des sirènes d’alarme plus claires qu’aujourd’hui avant qu’il ne soit trop
					tard. C’est pourquoi il est nécessaire d’y réfléchir même s'il existe peu d’arguments
					empiriques pour aider à y voir plus clair. Ces risques apocalyptiques sont liés au
					potentiel extraordinaire de l’IA générale, et passent par des innovations technologiques
					qui pourraient arriver dans 6 mois ou dans 10 ans.
				</p>
				<p>
					La recherche en alignement technique est notre meilleur espoir d’éviter ces risques car
					des mesures régulatoires ne peuvent que les ralentir. On n’arrête pas le progrès quand il
					y a des milliards de dollars à la clé.
				</p>
				<Button href="/dangers/pour-l'humanite">En apprendre davantage</Button>
			{/if}
		</svelte:fragment>
	</TabList>
</section>
