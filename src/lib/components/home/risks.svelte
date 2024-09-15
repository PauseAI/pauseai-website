<script lang="ts">
	import Button from '$components/Button.svelte'
	import TabList from '$components/TabList.svelte'
	import UnderlinedTitle from '$components/UnderlinedTitle.svelte'
	import Fly from '$components/Fly.svelte'

	const label_id = 'risks-title'
</script>

<section aria-labelledby={label_id}>
	<Fly>
		<UnderlinedTitle id={label_id}>Les dangers</UnderlinedTitle>
	</Fly>
	<Fly>
		<TabList
			tabs={[
				'Économiques et matériels',
				'Pour les individus',
				'Pour la société',
				'Pour l’humanité'
			]}
			id="risks-tabs"
			let:tab
			{label_id}
		>
			{tab}
			<svelte:fragment slot="panel" let:tab>
				{#if tab === 'Économiques et matériels'}
					<p>
						<i>Maman, quand je serai grand, je serai… inutile ?</i> Les laboratoires d'IA ont pour
						projet d'automatiser
						<a href="https://www.palladiummag.com/2024/05/17/my-last-five-years-of-work/"
							>la totalité du travail humain d'ici 4 ans</a
						>. Qu'ils atteignent pleinement cet objectif ou non, il est évident que nous nous
						dirigeons vers un bouleversement majeur du marché du travail. Nous devons nous préparer
						à affronter un choc économique sans précédent.
					</p>
					<p>
						Les <a
							href="https://www.crowdstrike.com/cybersecurity-101/cyberattacks/ai-powered-cyberattacks/"
							>dangers économiques et matériels</a
						> liés aux intelligences artificielles menacent directement nos infrastructures, nos entreprises
						et nos ressources. Cette technologie introduit des vulnérabilités inédites et des possibilités
						de dysfonctionnements catastrophiques. Imaginez des attaques dévastatrices facilitées par
						l'IA, ou l'effondrement de secteurs entiers face à ces technologies de rupture. Ces dangers,
						bien que moins visibles que ceux menaçant directement les vies humaines, peuvent avoir des
						conséquences tout aussi massives.
					</p>
					<p>
						Nous devons faire preuve d’une vigilance accrue et mettre en place des régulations
						rigoureuses pour nous protéger.
					</p>
					<Button href="/dangers/economiques-et-materiels">En apprendre davantage</Button>
				{:else if tab === 'Pour les individus'}
					<p>
						Imaginez-vous sur une application de rencontre, échangeant des messages avec ce qui
						semble être la personne parfaite. Mais êtes-vous vraiment en train de discuter avec un
						être humain ? Aujourd'hui, la réponse peut sembler évidente, mais cette réalité est sur
						le point de changer radicalement. La technologie permettant de créer des conversations
						<a href="https://techxplore.com/news/2024-02-secrets-social-bots-ai-role.html"
							>indiscernables d'interactions humaines existe déjà</a
						>. Elle sera bientôt déployée et rendra impossible toute distinction entre un humain et
						une IA.
					</p>
					<p>
						Cette évolution rapide révèle à quel point l’IA s’immisce dans notre quotidien, menace
						notre intimité, notre sécurité et notre bien-être. Chaque jour, nous risquons de voir
						notre vie privée violée et nos <a href="https://arxiv.org/pdf/2403.14380"
							>opinions manipulées par la désinformation</a
						> : les conséquences seraient dévastatrices.
					</p>
					<Button href="/dangers/pour-les-individus">En apprendre davantage</Button>
				{:else if tab === 'Pour la société'}
					<p>
						Selon la majorité des experts, les intelligences artificielles seront capables de
						concevoir et synthétiser à très court terme des virus plus mortels que tout ce que nous
						connaissons aujourd'hui. Le <a href="https://arxiv.org/abs/2306.03809"
							>bioterrorisme assisté par l'IA</a
						>
						n'est qu'un exemple parmi une multitude de menaces émergentes. Le risque de
						<a
							href="https://blog.checkpoint.com/2023/03/15/check-point-research-conducts-initial-security-analysis-of-chatgpt4-highlighting-potential-scenarios-for-accelerated-cybercrime/"
							>cyberattaques dévastatrices</a
						>, orchestrées ou amplifiées par des IA sophistiquées, plane sur nos infrastructures
						critiques et nos systèmes de communication.
					</p>
					<p>
						Ces scénarios ne sont que la partie visible d'un danger bien plus large : l'IA menace le
						cœur même de notre société. Elle touche à la cohésion sociale et aux fondements de notre
						démocratie. Nos processus démocratiques sont fragilisés par la polarisation et la
						désinformation. Les biais raciaux s'exacerbent, l’automatisation des emplois se profile,
						et l'ombre de nouvelles formes de guerre et de terrorisme plane sur nous.
					</p>
					<Button href="/dangers/pour-la-societe">En apprendre davantage</Button>
				{:else if tab === 'Pour l’humanité'}
					<p>
						OpenAI, DeepMind, Anthropic et d'autres géants technologiques investissent des milliards
						de dollars dans la création d'une IA aux capacités surhumaines. Leurs dirigeants
						affirment qu'ils pourraient réussir dans les quatres prochaines années. Ils admettent ne
						pas savoir comment contrôler leur création et reconnaissent publiquement que <a
							href="https://www.cnn.com/2023/10/31/tech/sam-altman-ai-risk-taker/index.html"
							>l'humanité pourrait s'éteindre</a
						> à cause de celle-ci.
					</p>
					<p>
						Les plus éminents experts en IA ont signé une <a
							href="https://futureoflife.org/open-letter/pause-giant-ai-experiments/"
							>lettre ouverte</a
						> avertissant que "L'IA représente un risque existentiel pour l'humanité, au même titre que
						les pandémies et les guerres nucléaires."
					</p>
					<p>
						Les chercheurs spécialisés en sécurité de l'IA <a
							href="https://aiimpacts.org/wp-content/uploads/2023/04/Thousands_of_AI_authors_on_the_future_of_AI.pdf"
							>estiment à 30%</a
						> la probabilité d'une extinction de l'humanité causée par l'IA.
					</p>
					<p>
						Jamais auparavant l'humanité n'a fait face à une menace aussi imminente et
						potentiellement catastrophique. Contrairement à d'autres défis, la crise de l'IA se
						distingue par son extrême urgence et son potentiel de transformation radicale à très
						court terme, suscitant une mobilisation sans précédent des plus grands esprits de notre
						époque.
					</p>
					<p>Allons-nous attendre une catastrophe mondiale pour réagir ?</p>
					<Button href="/dangers/pour-l'humanite">En apprendre davantage</Button>
				{/if}
			</svelte:fragment>
		</TabList>
	</Fly>
</section>
