<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { meta } from './meta'
	import SignatoryCard from './SignatoryCard.svelte'
	import QuoteHighlight from './QuoteHighlight.svelte'

	export let data

	const { signatories } = data
	const { title, description, date } = meta

	// Separate parliamentarians from organizations (excluding PauseAI)
	const parliamentarians = signatories.filter((s) => s.type !== 'Organization')
	const organizations = signatories.filter(
		(s) => s.type === 'Organization' && s.name !== 'PauseAI Global'
	)

	// Sort parliamentarians alphabetically by last name (as in the PDF)
	const sortedParliamentarians = parliamentarians.sort((a, b) => {
		const getLastName = (name) => {
			// Handle titles and complex names
			let cleanName = name
				.replace(/^(Lord|Baroness|Right Revd Dr|Sir|Dame)\s+/, '')
				.replace(/\s+(MC|TD|MP|MSP|MS|MLA)$/, '')

			const parts = cleanName.split(' ')
			return parts[parts.length - 1].toLowerCase()
		}

		return getLastName(a.name).localeCompare(getLastName(b.name))
	})

	// Map organization names to their logo files and websites
	const organizationLogos = {
		'Open Rights Group': '/open-letter/civil_society_logos/open_rights_group.png',
		'Connected by Data': '/open-letter/civil_society_logos/connected_by_data.png',
		'Open Data Manchester': '/open-letter/civil_society_logos/open_data_manchester.png',
		'Safe AI for Children Alliance':
			'/open-letter/civil_society_logos/safe_ai_for_children_alliance.png'
	}

	const organizationWebsites = {
		'Open Rights Group': 'https://www.openrightsgroup.org/',
		'Connected by Data': 'https://connectedbydata.org/',
		'Open Data Manchester': 'https://www.opendatamanchester.org.uk/',
		'Safe AI for Children Alliance': 'https://www.safeaiforchildren.org/'
	}

	// Selected quotes from signatories with their portraits
	const quotes = [
		{
			name: 'Lord Browne of Ladyton',
			portrait: '/open-letter/portraits/processed/lords/browne.jpg',
			title: 'Peer',
			quote:
				'If leading companies like Google treat these commitments as optional, we risk a dangerous race to deploy increasingly powerful AI without proper safeguards.'
		},
		{
			name: 'Baroness Kidron',
			portrait: '/open-letter/portraits/processed/lords/kidron.jpg',
			title: 'Peer',
			quote:
				'Safety cannot be a secret. Like any AI company, Google must publish the details of their testing procedure.'
		},
		{
			name: 'The Lord Bishop of Oxford',
			displayName: 'Right Revd Dr Steven Croft',
			portrait: '/open-letter/portraits/processed/lords/oxford.jpg',
			title: 'Bishop',
			quote:
				"Ethics cannot be an afterthought in AI development. Google's failure to honor their safety commitments betrays the trust necessary for responsible innovation."
		},
		{
			name: 'Baroness Chakrabarti',
			portrait: '/open-letter/portraits/processed/lords/chakrabarti.jpg',
			title: 'Peer',
			quote:
				'AI safety commitments without transparency are meaningless. The public has a right to know how these powerful systems are tested.'
		},
		{
			name: 'Iqbal Mohamed MP',
			portrait: '/open-letter/portraits/processed/commons/iqbal_mohamed.jpg',
			title: 'MP',
			quote:
				'The UK government and the governments around the world need to step up and protect the people that elected them, and not be afraid to regulate tech companies.'
		},
		{
			name: 'Ben Lake MP',
			portrait: '/open-letter/portraits/processed/commons/ben_lake.jpg',
			title: 'MP',
			quote:
				"AI safety isn't just for Silicon Valley to decide. Google must be transparent about who tests their systems."
		},
		{
			name: 'Sir Desmond Swayne TD MP',
			portrait: '/open-letter/portraits/processed/commons/desmond_swayne.jpg',
			title: 'MP',
			quote:
				"Big Tech shouldn't be above the commitments they make. Google must come clean about their AI safety testing."
		}
	]
</script>

<PostMeta {title} {description} {date} />

<article class="open-letter">
	<!-- Hero Section -->
	<section class="hero-section">
		<div class="hero-background">
			<div class="hero-gradient"></div>
			<div class="hero-pattern"></div>
		</div>
		<div class="hero-content">
			<div class="hero-badge">Open Letter</div>
			<h1 class="hero-title">{title}</h1>
			<p class="hero-subtitle">
				Parliamentarians from across the UK call on Google DeepMind to honour their AI safety
				commitments
			</p>
			<div class="hero-stats">
				<div class="stat-card">
					<div class="stat-number">64</div>
					<div class="stat-label">Parliamentarians</div>
				</div>
				<div class="stat-card">
					<div class="stat-number">5</div>
					<div class="stat-label">Chambers</div>
				</div>
				<div class="stat-card">
					<div class="stat-number">4</div>
					<div class="stat-label">Organizations</div>
				</div>
			</div>
			<div class="hero-date">22 August 2025</div>
		</div>
	</section>

	<!-- Quotes Section -->
	<section class="quotes-section">
		<div class="quotes-container">
			<h2 class="quotes-title">
				<span class="quotes-label">Voices of Concern</span>
				What parliamentarians are saying
			</h2>
			<div class="quotes-grid">
				{#each quotes as quote, i}
					<div class="quote-wrapper" style="animation-delay: {i * 0.1}s">
						<QuoteHighlight {quote} />
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Letter Content -->
	<section class="letter-section">
		<div class="letter-container">
			<div class="letter-content">
				<div class="letter-header-info">
					<div class="from">
						<strong>From:</strong> PauseAI UK<br />
						5 Brayford Square<br />
						London E1 0SG
					</div>
					<div class="to">
						<strong>To:</strong> Sir Demis Hassabis<br />
						Chief Executive Officer, Google DeepMind<br />
						London, United Kingdom
					</div>
				</div>

				<div class="letter-body">
					<p class="salutation">Dear Sir Demis,</p>

					<p>
						We write to express profound concern about Google DeepMind's failure to honour the
						Frontier AI Safety Commitments signed at the AI Seoul Summit in 2024. The release of
						Gemini 2.5 Pro without the transparency required by paragraph VIII of the commitments
						represents a troubling breach of trust with governments and the public.
					</p>

					<p>At the AI Seoul Summit, Google explicitly committed to:</p>
					<ul class="commitments">
						<li>
							Conducting safety tests "before deploying" AI models with input from "independent
							third-party evaluators" as appropriate.
						</li>
						<li>Providing "public transparency" into testing processes.</li>
						<li>
							Disclosing "how, if at all, external actors, such as governments... are involved in
							the process".
						</li>
					</ul>

					<p>
						Yet when you released Gemini 2.5 Pro on 25 March, no safety evaluation report
						accompanied it. A month later, only a minimal "model card" appeared, lacking any
						substantive detail about external evaluations. Even when directly questioned by
						journalists, Google refused to confirm whether government agencies like the UK AI
						Security Institute participated in testing.
					</p>

					<p class="emphasis">
						This is not a matter of semantics or technicalities. Labelling a publicly accessible
						model as "experimental" does not absolve Google of its safety obligations. When anyone
						on the internet can use a frontier AI system, it has been deployed in every meaningful
						sense.
					</p>

					<p>
						You yourself have stated that AGI may arrive within five years. Leading AI researchers,
						such as Geoffrey Hinton and Yoshua Bengio, estimate a 10% or greater chance that
						advanced AI could cause human extinction. These are not distant hypotheticals but
						near-term possibilities requiring immediate, serious action.
					</p>

					<p>
						We are particularly troubled that Google, having helped establish these safety
						standards, would be among the first to abandon them. This sets a dangerous precedent
						that undermines global efforts to develop AI safely. If industry leaders treat safety
						commitments as optional when convenient, how can we expect others to take them
						seriously?
					</p>

					<div class="demands">
						<p><strong>We therefore call on Google DeepMind to:</strong></p>
						<ol>
							<li>
								Establish clear definitions of "deployment" that align with common understanding -
								when a model is publicly accessible, it is deployed.
							</li>
							<li>
								Publish a specific timeline for when safety evaluation reports will be released for
								all future models.
							</li>
							<li>
								Clarify unambiguously, for each model release, which government agencies and
								independent third-parties are involved in testing, and the exact timelines of their
								testing procedures.
							</li>
						</ol>
					</div>

					<p class="conclusion">
						The development of artificial general intelligence may be humanity's most consequential
						undertaking. It demands the highest standards of responsibility, transparency, and
						caution. Google's technical capabilities come with commensurate obligations to society.
					</p>

					<p>We await your response and concrete actions to address these critical concerns.</p>

					<p class="closing">Yours sincerely,</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Signatories Section -->
	<section class="signatories-section">
		<div class="signatories-header">
			<h2 class="signatories-title">
				<span class="title-number">{signatories.length - 1}</span>
				<span class="title-text">Distinguished Signatories</span>
			</h2>
			<p class="signatories-subtitle">United in calling for AI safety transparency</p>
		</div>

		<div class="signatories-container">
			<div class="signatories-grid">
				{#each sortedParliamentarians as signatory, i}
					<div class="signatory-wrapper" style="animation-delay: {i * 0.02}s">
						<SignatoryCard {signatory} />
					</div>
				{/each}
			</div>
		</div>

		{#if organizations.length > 0}
			<div class="organizations-section">
				<div class="organizations-grid">
					{#each organizations as org}
						<a
							href={organizationWebsites[org.name]}
							target="_blank"
							rel="noopener noreferrer"
							class="organization-card organization-link"
						>
							{#if organizationLogos[org.name]}
								<img
									src={organizationLogos[org.name]}
									alt="{org.name} logo"
									class="organization-logo"
									loading="lazy"
								/>
							{:else}
								<div class="organization-name">{org.name}</div>
							{/if}
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</section>
</article>

<style>
	.open-letter {
		width: 100vw;
		margin-left: calc(-50vw + 50%);
		overflow-x: hidden;
	}

	/* Hero Section */
	.hero-section {
		position: relative;
		min-height: 80vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
		overflow: hidden;
	}

	.hero-background {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.hero-gradient {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(circle at 30% 20%, rgba(255, 138, 0, 0.15) 0%, transparent 50%),
			radial-gradient(circle at 70% 80%, rgba(255, 100, 0, 0.1) 0%, transparent 50%);
		animation: gradientShift 20s ease-in-out infinite;
	}

	@keyframes gradientShift {
		0%,
		100% {
			opacity: 0.8;
		}
		50% {
			opacity: 1;
		}
	}

	.hero-pattern {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(255, 138, 0, 0.03) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 138, 0, 0.03) 1px, transparent 1px);
		background-size: 50px 50px;
		animation: patternMove 60s linear infinite;
	}

	@keyframes patternMove {
		0% {
			transform: translate(0, 0);
		}
		100% {
			transform: translate(50px, 50px);
		}
	}

	.hero-content {
		position: relative;
		z-index: 1;
		text-align: center;
		padding: 3rem 2rem;
		max-width: 1200px;
		animation: fadeInUp 1s ease-out;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.hero-badge {
		display: inline-block;
		background: linear-gradient(135deg, var(--brand) 0%, #ff6600 100%);
		color: white;
		padding: 0.5rem 1.5rem;
		border-radius: 100px;
		font-size: 0.9rem;
		font-weight: 600;
		margin-bottom: 2rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
	}

	.hero-title {
		font-size: clamp(2.5rem, 5vw, 4rem);
		font-weight: 800;
		background: linear-gradient(135deg, #ffffff 0%, #cccccc 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: 1.5rem;
		line-height: 1.2;
	}

	.hero-subtitle {
		font-size: clamp(1.1rem, 2vw, 1.5rem);
		color: rgba(255, 255, 255, 0.8);
		max-width: 800px;
		margin: 0 auto 3rem;
		line-height: 1.6;
	}

	.hero-stats {
		display: flex;
		gap: 2rem;
		justify-content: center;
		margin-bottom: 2rem;
		flex-wrap: wrap;
	}

	.stat-card {
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		padding: 1.5rem 2rem;
		transition: all 0.3s ease;
	}

	.stat-card:hover {
		background: rgba(255, 255, 255, 0.08);
		transform: translateY(-5px);
		box-shadow: 0 10px 30px rgba(255, 138, 0, 0.2);
	}

	.stat-number {
		font-size: 2.5rem;
		font-weight: 800;
		color: var(--brand);
		margin-bottom: 0.5rem;
	}

	.stat-label {
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.hero-date {
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.5);
		margin-top: 2rem;
	}

	/* Letter Section */
	.letter-section {
		background: linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%);
		padding: 5rem 0;
	}

	.letter-container {
		max-width: 900px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.letter-content {
		background: white;
		border-radius: 20px;
		padding: 3rem;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
		border-left: 5px solid var(--brand);
		position: relative;
		animation: fadeIn 1s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.letter-header-info {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--border-color);
		font-size: 0.95rem;
	}

	@media (max-width: 600px) {
		.letter-header-info {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
	}

	.salutation {
		font-weight: 600;
	}

	.commitments {
		background: var(--bg);
		padding: 1.5rem;
		border-radius: 6px;
		border-left: 3px solid var(--brand);
		margin: 1.5rem 0;
	}

	.commitments li {
		margin-bottom: 0.75rem;
	}

	.emphasis {
		font-weight: 600;
		color: var(--brand);
		background: var(--bg);
		padding: 1rem;
		border-radius: 6px;
		border-left: 3px solid var(--brand);
	}

	.demands {
		background: var(--bg);
		padding: 1.5rem;
		border-radius: 6px;
		border-left: 3px solid var(--brand);
		margin: 2rem 0;
	}

	.demands ol {
		margin-top: 1rem;
	}

	.demands li {
		margin-bottom: 1rem;
	}

	.conclusion {
		font-weight: 600;
		margin: 2rem 0;
	}

	.closing {
		font-weight: 600;
		margin-top: 2rem;
	}

	/* Quotes Section */
	.quotes-section {
		background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
		padding: 5rem 0;
		position: relative;
		overflow: hidden;
	}

	.quotes-section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--brand), transparent);
	}

	.quotes-container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.quotes-title {
		text-align: center;
		margin-bottom: 4rem;
		position: relative;
	}

	.quotes-label {
		display: block;
		font-size: 0.9rem;
		color: var(--brand);
		text-transform: uppercase;
		letter-spacing: 0.2em;
		margin-bottom: 0.5rem;
		font-weight: 600;
	}

	.quotes-title {
		font-size: clamp(2rem, 4vw, 3rem);
		font-weight: 800;
		color: white;
	}

	.quotes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 2rem;
	}

	.quote-wrapper {
		animation: slideIn 1s ease-out both;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(-20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@media (max-width: 850px) {
		.quotes-grid {
			grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		}
	}

	@media (max-width: 768px) {
		.quotes-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.quotes-section {
			padding: 1.5rem 0;
		}

		.quotes-section h2 {
			font-size: 1.5rem;
			margin-bottom: 2rem;
		}
	}

	/* Signatories Section */
	.signatories-section {
		background: linear-gradient(180deg, #f5f5f5 0%, #ffffff 100%);
		padding: 5rem 0;
		position: relative;
	}

	.signatories-header {
		text-align: center;
		margin-bottom: 4rem;
		animation: fadeInUp 1s ease-out;
	}

	.signatories-title {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}

	.title-number {
		font-size: clamp(3rem, 5vw, 4rem);
		font-weight: 900;
		background: linear-gradient(135deg, var(--brand) 0%, #ff6600 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.title-text {
		font-size: clamp(2rem, 4vw, 3rem);
		font-weight: 800;
		color: #1a1a1a;
	}

	.signatories-subtitle {
		font-size: 1.2rem;
		color: #666;
		margin: 0;
	}

	.signatories-container {
		max-width: 1600px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.signatories-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.signatory-wrapper {
		animation: fadeInScale 0.6s ease-out both;
	}

	@keyframes fadeInScale {
		from {
			opacity: 0;
			transform: scale(0.9);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	/* Organizations Section */
	.organizations-section {
		margin-top: 4rem;
		padding: 3rem 0;
		background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
		border-radius: 30px;
		position: relative;
		overflow: hidden;
	}

	.organizations-section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 100px;
		height: 3px;
		background: linear-gradient(90deg, transparent, var(--brand), transparent);
	}

	.organizations-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.organization-card {
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.05) 0%,
			rgba(255, 255, 255, 0.02) 100%
		);
		backdrop-filter: blur(10px);
		border-radius: 20px;
		padding: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 150px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: hidden;
		box-sizing: border-box;
	}

	.organization-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: radial-gradient(circle at center, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.organization-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
		border-color: var(--brand);
	}

	.organization-card:hover::before {
		opacity: 1;
	}

	.organization-link {
		text-decoration: none;
		color: inherit;
		cursor: pointer;
	}

	.organization-link:hover {
		text-decoration: none;
	}

	.organization-logo {
		max-width: 90%;
		height: 60px;
		width: auto;
		object-fit: contain;
		position: relative;
		z-index: 1;
		filter: brightness(1.1);
	}

	.organization-name {
		font-weight: 600;
		text-align: center;
		color: white;
		font-size: 1rem;
		position: relative;
		z-index: 1;
	}

	/* Mobile Responsive Styles */
	@media (max-width: 768px) {
		.hero-section {
			min-height: 70vh;
		}

		.hero-stats {
			gap: 1rem;
		}

		.stat-card {
			padding: 1rem 1.5rem;
		}

		.stat-number {
			font-size: 2rem;
		}

		.letter-content {
			padding: 2rem 1.5rem;
		}

		.signatories-grid {
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		}

		.organizations-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
	}

	@media (max-width: 480px) {
		.hero-content {
			padding: 2rem 1rem;
		}

		.hero-title {
			font-size: 2rem;
		}

		.hero-subtitle {
			font-size: 1rem;
		}

		.stat-card {
			padding: 0.75rem 1rem;
		}

		.stat-number {
			font-size: 1.5rem;
		}

		.letter-content {
			padding: 1.5rem 1rem;
			border-radius: 10px;
		}

		.signatories-grid {
			grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
			gap: 0.75rem;
		}

		.organization-card {
			padding: 1.5rem;
			min-height: 100px;
		}

		.organization-logo {
			height: 40px;
			max-width: 80%;
		}
	}
</style>
