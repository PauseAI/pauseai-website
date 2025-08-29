<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { meta } from './meta'
	import SignatoryCard from './SignatoryCard.svelte'
	import QuoteHighlight from './QuoteHighlight.svelte'
	import { theme } from '$lib/theme'

	export let data

	const { signatories } = data

	const { title, description, date } = meta

	// Separate parliamentarians from organizations (excluding PauseAI)
	const parliamentarians = signatories.filter((s: { type?: string }) => s.type !== 'Organization')
	const organizationsUnsorted = signatories.filter(
		(s: { type?: string; name?: string }) =>
			s.type === 'Organization' && s.name !== 'PauseAI Global'
	)

	// Custom order for organizations
	const organizationOrder = [
		'Open Rights Group',
		'Connected by Data',
		'Safe AI for Children Alliance',
		'Open Data Manchester'
	]

	const organizations: { name: string; type: string }[] = organizationsUnsorted.sort(
		(a: { name: string }, b: { name: string }) => {
			const aIndex = organizationOrder.indexOf(a.name)
			const bIndex = organizationOrder.indexOf(b.name)
			if (aIndex === -1) return 1
			if (bIndex === -1) return -1
			return aIndex - bIndex
		}
	)

	// Sort parliamentarians alphabetically by last name (as in the PDF)
	const sortedParliamentarians = parliamentarians.sort(
		(a: { name: string }, b: { name: string }) => {
			const getLastName = (name: string) => {
				// Handle titles and complex names
				let cleanName = name
					.replace(/^(Lord|Baroness|Right Revd Dr|Sir|Dame)\s+/, '')
					.replace(/\s+(MC|TD|MP|MSP|MS|MLA)$/, '')

				const parts = cleanName.split(' ')
				return parts[parts.length - 1].toLowerCase()
			}

			return getLastName(a.name).localeCompare(getLastName(b.name))
		}
	)

	// Map organization names to their logo files (theme-aware with cache busting)
	$: organizationLogos = {
		'Open Rights Group': `/open-letter/civil_society_logos/${$theme === 'dark' ? 'white' : 'black'}/open_rights_group.png?theme=${$theme}`,
		'Connected by Data': `/open-letter/civil_society_logos/${$theme === 'dark' ? 'white' : 'black'}/connected_by_data.png?theme=${$theme}`,
		'Open Data Manchester': `/open-letter/civil_society_logos/${$theme === 'dark' ? 'white' : 'black'}/open_data_manchester.png?theme=${$theme}`,
		'Safe AI for Children Alliance': `/open-letter/civil_society_logos/${$theme === 'dark' ? 'white' : 'black'}/safe_ai_for_children_alliance.png?theme=${$theme}`
	} as Record<string, string>

	function getOrganizationWebsite(name: string): string {
		const websites = {
			'Open Rights Group': 'https://www.openrightsgroup.org/',
			'Connected by Data': 'https://connectedbydata.org/',
			'Open Data Manchester': 'https://www.opendatamanchester.org.uk/',
			'Safe AI for Children Alliance': 'https://www.safeaiforchildren.org/'
		} as const
		return websites[name as keyof typeof websites] || '#'
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
				"Voluntary safety promises only work if they're transparent. It is important to understand the timeline, know the identity of those who have tested it, and have faith in the process."
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
					<div class="stat-number">4</div>
					<div class="stat-label">Civil Society Organisations</div>
				</div>
				<div class="stat-card">
					<div class="stat-number">10+</div>
					<div class="stat-label">Political Parties</div>
				</div>
				<div class="stat-card">
					<div class="stat-number">60</div>
					<div class="stat-label">Parliamentarians</div>
				</div>
			</div>
			<div class="hero-date">29 August 2025</div>
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
		<div class="letter-background">
			<div class="letter-gradient"></div>
			<div class="letter-pattern"></div>
		</div>
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
				<span class="title-number">60</span>
				<span class="title-text">Signatories</span>
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
			<div class="organizations-subsection">
				<div class="organizations-grid">
					{#each organizations as org}
						<a
							href={getOrganizationWebsite(org.name)}
							target="_blank"
							rel="noopener noreferrer"
							class="organization-card organization-link"
						>
							{#if organizationLogos[org.name]}
								{#key $theme}
									<img
										src={organizationLogos[org.name]}
										alt="{org.name} logo"
										class="organization-logo"
										loading="lazy"
									/>
								{/key}
							{:else}
								<div class="organization-name">{org.name}</div>
							{/if}
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</section>

	<!-- Background Information Section -->
	<section class="background-section">
		<div class="background-container">
			<div class="background-content">
				<div class="background-text">
					<h2 class="background-title">Learn More</h2>
					<p class="background-description">
						More detail about Google DeepMind's violation can be found in our background information
						document.
					</p>
				</div>
				<div class="pdf-link-container">
					<a
						href="/pdfs/PauseAI_Open_Letter_Background_Information.pdf"
						target="_blank"
						class="pdf-thumbnail"
					>
						<img
							src="/pdfs/PauseAI_Open_Letter_Background_Information_page-1.jpg"
							alt="Background document thumbnail"
							class="pdf-thumbnail-image"
						/>
						<div class="pdf-info">
							<span class="pdf-title">Background Information</span>
						</div>
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- How This Letter Came About Section -->
	<section class="campaign-section">
		<div class="campaign-container">
			<div class="campaign-content">
				<h2 class="campaign-title">How You Can Help</h2>
				<p class="campaign-description">
					PauseAI volunteers emailed their MPs asking them to sign this letter to Sir Demis
					Hassabis, calling for transparency in Google DeepMind's AI safety commitments.
				</p>
				<div class="campaign-cta">
					<a href="/uk-email-mp" class="cta-button">
						<span class="cta-text">Email Your MP</span>
						<span class="cta-subtitle">Ask them to sign the letter</span>
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- Contact Section -->
	<section class="contact-section">
		<div class="contact-container">
			<p class="contact-text">
				For enquiries contact <a href="mailto:joseph@pauseai.info" class="contact-link"
					>Joseph Miller at joseph@pauseai.info</a
				>
			</p>
		</div>
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
		background: linear-gradient(135deg, var(--bg-subtle) 0%, var(--bg) 100%);
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
			linear-gradient(rgba(255, 138, 0, 0.1) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 138, 0, 0.1) 1px, transparent 1px);
		background-size: 50px 50px;
		animation: patternMove 60s linear infinite;
	}

	@media (prefers-color-scheme: light) {
		.hero-pattern {
			background-image:
				linear-gradient(rgba(255, 138, 0, 0.15) 1px, transparent 1px),
				linear-gradient(90deg, rgba(255, 138, 0, 0.15) 1px, transparent 1px);
		}
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
		color: var(--text);
		margin-bottom: 1.5rem;
		line-height: 1.2;
	}

	.hero-subtitle {
		font-size: clamp(1.1rem, 2vw, 1.5rem);
		color: var(--text);
		opacity: 0.8;
		max-width: 800px;
		margin: 0 auto 3rem;
		line-height: 1.6;
	}

	.hero-date {
		font-size: 1.1rem;
		color: var(--text) !important;
		opacity: 0.7;
		font-weight: 500;
		margin-top: 2rem;
	}

	@media (prefers-color-scheme: light) {
		.hero-date {
			color: black !important;
		}
	}

	.hero-stats {
		display: flex;
		gap: 2rem;
		justify-content: center;
		margin-bottom: 2rem;
		flex-wrap: wrap;
	}

	.stat-card {
		background: var(--bg);
		backdrop-filter: blur(10px);
		border: 1px solid var(--brand);
		border-radius: 16px;
		padding: 1.5rem 2rem;
		transition: all 0.3s ease;
		min-width: 200px;
		text-align: center;
		flex: 1;
		opacity: 0.9;
	}

	.stat-card:hover {
		background: var(--bg-subtle);
		transform: translateY(-5px);
		box-shadow: 0 10px 30px rgba(255, 138, 0, 0.2);
		opacity: 1;
	}

	.stat-number {
		font-size: 2.5rem;
		font-weight: 800;
		color: var(--brand);
		margin-bottom: 0.5rem;
	}

	.stat-label {
		font-size: 0.9rem;
		color: var(--text);
		opacity: 0.7;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Letter Section */
	.letter-section {
		position: relative;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, var(--bg-subtle) 0%, var(--bg) 100%);
		overflow: hidden;
		padding: 8rem 0;
	}

	.letter-background {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.letter-gradient {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(circle at 30% 20%, rgba(255, 138, 0, 0.15) 0%, transparent 50%),
			radial-gradient(circle at 70% 80%, rgba(255, 100, 0, 0.1) 0%, transparent 50%);
		animation: gradientShift 20s ease-in-out infinite;
	}

	.letter-pattern {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(255, 138, 0, 0.03) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 138, 0, 0.03) 1px, transparent 1px);
		background-size: 50px 50px;
		animation: patternMove 60s linear infinite;
	}

	.letter-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
		position: relative;
		z-index: 1;
	}

	.letter-content {
		background: var(--bg);
		backdrop-filter: blur(20px);
		border-radius: 32px;
		padding: 5rem;
		box-shadow:
			0 40px 80px rgba(0, 0, 0, 0.3),
			0 20px 40px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 138, 0, 0.1),
			0 0 0 1px rgba(255, 138, 0, 0.2);
		position: relative;
		animation: letterSlideIn 1.2s ease-out;
		border: 1px solid rgba(255, 138, 0, 0.3);
		overflow: hidden;
		color: var(--text);
	}

	.letter-content::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 6px;
		background: linear-gradient(
			90deg,
			var(--brand) 0%,
			#ff6600 25%,
			#ff8c00 50%,
			#ff6600 75%,
			var(--brand) 100%
		);
		border-radius: 32px 32px 0 0;
	}

	.letter-content::after {
		content: '';
		position: absolute;
		top: -2px;
		left: -2px;
		right: -2px;
		bottom: -2px;
		background: linear-gradient(45deg, transparent, rgba(255, 138, 0, 0.1), transparent);
		border-radius: 34px;
		z-index: -1;
		animation: shimmer 3s ease-in-out infinite;
	}

	@keyframes letterSlideIn {
		from {
			opacity: 0;
			transform: translateY(40px) scale(0.95);
			filter: blur(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
			filter: blur(0);
		}
	}

	@keyframes shimmer {
		0%,
		100% {
			opacity: 0;
		}
		50% {
			opacity: 1;
		}
	}

	.letter-header-info {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3rem;
		margin-bottom: 3rem;
		padding: 2rem;
		background: linear-gradient(135deg, rgba(255, 138, 0, 0.05) 0%, rgba(255, 138, 0, 0.02) 100%);
		border-radius: 20px;
		border: 1px solid rgba(255, 138, 0, 0.15);
		font-size: 1rem;
		position: relative;
		overflow: hidden;
		color: var(--text);
	}

	.letter-header-info::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, transparent, var(--brand), transparent);
	}

	@media (max-width: 600px) {
		.letter-header-info {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
	}

	.salutation {
		font-weight: 700;
		font-size: 1.1rem;
		color: var(--brand);
		margin-bottom: 1.5rem;
		position: relative;
		padding-left: 1rem;
	}

	.salutation::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 4px;
		height: 20px;
		background: var(--brand);
		border-radius: 2px;
	}

	.commitments {
		background: rgba(255, 138, 0, 0.05);
		padding: 2.5rem;
		border-radius: 20px;
		border: 2px solid rgba(255, 138, 0, 0.2);
		margin: 2.5rem 0;
		position: relative;
		overflow: hidden;
		box-shadow:
			0 10px 30px rgba(0, 0, 0, 0.1),
			inset 0 1px 0 rgba(255, 138, 0, 0.1);
		color: var(--text);
	}

	.commitments::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 6px;
		height: 100%;
		background: linear-gradient(180deg, var(--brand) 0%, #ff6600 100%);
	}

	.commitments li {
		margin-bottom: 1.2rem;
		position: relative;
		padding-left: 1.5rem;
		font-size: 1.05rem;
		line-height: 1.7;
	}

	.commitments li::before {
		content: '✓';
		position: absolute;
		left: 0;
		top: 0;
		color: var(--brand);
		font-weight: bold;
		font-size: 1.1rem;
	}

	.emphasis {
		font-weight: 700;
		color: var(--text);
		background: linear-gradient(135deg, rgba(255, 138, 0, 0.1) 0%, rgba(255, 138, 0, 0.05) 100%);
		padding: 2rem;
		border-radius: 16px;
		border-left: 5px solid var(--brand);
		margin: 2rem 0;
		font-size: 1.1rem;
		line-height: 1.8;
		position: relative;
		box-shadow: 0 8px 25px rgba(255, 138, 0, 0.15);
		border-radius: 6px;
		border-left: 3px solid var(--brand);
	}

	.demands {
		background: rgba(255, 138, 0, 0.05);
		padding: 2.5rem;
		border-radius: 20px;
		border: 2px solid rgba(255, 138, 0, 0.2);
		margin: 2.5rem 0;
		position: relative;
		overflow: hidden;
		box-shadow:
			0 10px 30px rgba(0, 0, 0, 0.1),
			inset 0 1px 0 rgba(255, 138, 0, 0.1);
		color: var(--text);
	}

	.demands::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 6px;
		height: 100%;
		background: linear-gradient(180deg, var(--brand) 0%, #ff6600 100%);
	}

	.demands ol {
		margin-top: 1.5rem;
		padding-left: 0;
		counter-reset: demand-counter;
	}

	.demands li {
		margin-bottom: 1.5rem;
		position: relative;
		padding-left: 3rem;
		font-size: 1.05rem;
		line-height: 1.7;
		list-style: none;
		counter-increment: demand-counter;
	}

	.demands li::before {
		content: counter(demand-counter);
		position: absolute;
		left: 0;
		top: 0;
		width: 2rem;
		height: 2rem;
		background: var(--brand);
		color: var(--text);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 1rem;
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
		background: linear-gradient(135deg, var(--bg-subtle) 0%, var(--bg) 100%);
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
		color: var(--text);
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
		background: linear-gradient(135deg, var(--bg-subtle) 0%, var(--bg) 100%);
		padding: 4rem 0;
		position: relative;
		overflow: hidden;
	}

	.signatories-section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--brand), transparent);
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
		line-height: 1.1;
		display: inline-block;
		padding: 0.1em 0;
	}

	.title-text {
		font-size: clamp(2rem, 4vw, 3rem);
		font-weight: 800;
		color: var(--text);
	}

	.signatories-subtitle {
		font-size: 1.2rem;
		color: var(--text);
		opacity: 0.7;
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
		margin-bottom: 0;
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

	/* Organizations Subsection */
	.organizations-subsection {
		margin-top: 2rem;
		padding-top: 4rem;
		border-top: 2px solid rgba(255, 138, 0, 0.05);
		position: relative;
	}

	.organizations-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1.5rem;
		max-width: 1000px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.organization-card {
		background: var(--bg);
		border-radius: 12px;
		padding: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 140px;
		border: 2px solid rgba(255, 138, 0, 0.15);
		transition: all 0.3s ease;
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
		box-shadow: 0 4px 12px rgba(255, 138, 0, 0.2);
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
		color: var(--text);
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

		.letter-container {
			padding: 0 1rem;
		}

		.letter-content {
			padding: 2rem 1.25rem;
			border-radius: 16px;
		}

		.letter-header-info {
			padding: 1.25rem;
			gap: 1.5rem;
		}

		.letter-body {
			padding: 0.5rem 0;
		}

		.letter-body p {
			margin-bottom: 1rem;
			font-size: 0.95rem;
		}

		.commitments {
			padding: 1.25rem;
			margin: 1.5rem 0;
		}

		.commitments li {
			padding-left: 0;
			display: flex;
			align-items: flex-start;
			gap: 0.75rem;
		}

		.commitments li::before {
			position: static;
			flex-shrink: 0;
		}

		.emphasis {
			padding: 1.25rem;
			font-size: 1rem;
			margin: 1.5rem 0;
		}

		.demands {
			padding: 1.5rem 1rem;
			margin: 1.5rem 0;
		}

		.demands li {
			padding-left: 0;
			font-size: 0.95rem;
			margin-bottom: 1.25rem;
			display: flex;
			align-items: flex-start;
			gap: 0.75rem;
		}

		.demands li::before {
			position: static;
			width: 1.75rem;
			height: 1.75rem;
			font-size: 0.9rem;
			flex-shrink: 0;
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
			padding: 2.5rem 1.5rem;
			border-radius: 20px;
		}
		.letter-header-info {
			padding: 1rem;
			gap: 1.5rem;
			font-size: 0.95rem;
		}
		.commitments {
			padding: 1.5rem;
		}
		.emphasis {
			padding: 1.25rem;
			font-size: 1rem;
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

		.campaign-content {
			padding: 3rem 2rem;
		}

		.cta-button {
			padding: 1rem 2rem;
		}

		.cta-text {
			font-size: 1rem;
		}

		.cta-subtitle {
			font-size: 0.8rem;
		}
	}

	/* Background Section */
	.background-section {
		background: linear-gradient(135deg, var(--bg-subtle) 0%, var(--bg) 100%);
		padding: 3rem 0;
		position: relative;
		overflow: hidden;
	}

	.background-section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--brand), transparent);
	}

	.background-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.background-content {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		max-width: 700px;
		margin: 0 auto;
	}

	.background-text {
		flex: 1;
		text-align: left;
		max-width: 400px;
	}

	.background-title {
		font-size: clamp(1.8rem, 3vw, 2.5rem);
		font-weight: 800;
		margin-bottom: 1rem;
		color: var(--text);
	}

	.background-description {
		font-size: 1rem;
		line-height: 1.6;
		margin-bottom: 0;
		color: var(--text);
		opacity: 0.8;
	}

	.pdf-link-container {
		flex-shrink: 0;
	}

	.pdf-thumbnail {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1.5rem;
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 16px;
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		text-decoration: none;
		color: var(--text);
		transition: all 0.3s ease;
		width: 160px;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
	}

	.pdf-thumbnail:hover {
		border-color: var(--brand);
		background: rgba(255, 255, 255, 0.08);
		transform: translateY(-3px);
		box-shadow: 0 10px 25px rgba(255, 138, 0, 0.2);
	}

	.pdf-thumbnail-image {
		width: 100%;
		height: auto;
		border-radius: 8px;
		margin-bottom: 1rem;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
		transition: transform 0.3s ease;
	}

	.pdf-thumbnail:hover .pdf-thumbnail-image {
		transform: scale(1.02);
	}

	.pdf-info {
		text-align: center;
	}

	.pdf-title {
		display: block;
		font-weight: 700;
		font-size: 0.9rem;
		margin-bottom: 0.25rem;
		color: var(--text);
	}

	@media (max-width: 768px) {
		.background-section {
			padding: 2rem 0;
		}

		.background-content {
			flex-direction: column;
			gap: 2rem;
			text-align: center;
		}

		.background-text {
			text-align: center;
		}

		.pdf-thumbnail {
			width: 180px;
			padding: 1rem;
		}

		.background-description {
			font-size: 0.95rem;
		}
	}

	/* Campaign Section */
	.campaign-section {
		background: linear-gradient(135deg, var(--brand) 0%, #ff6600 100%);
		color: var(--text);
		padding: 3rem 0;
		position: relative;
		overflow: hidden;
	}

	.campaign-section::before {
		content: '';
		position: absolute;
		inset: 0;
		background:
			radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
			radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
		pointer-events: none;
	}

	.campaign-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
		position: relative;
		z-index: 1;
	}

	.campaign-content {
		text-align: center;
		padding: 2.5rem;
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(20px);
		border-radius: 24px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow:
			0 20px 40px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.campaign-title {
		font-size: clamp(1.8rem, 3vw, 2.5rem);
		font-weight: 800;
		margin-bottom: 1rem;
		color: var(--text);
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.campaign-description {
		font-size: 1rem;
		line-height: 1.6;
		margin-bottom: 2rem;
		color: rgba(255, 255, 255, 0.9);
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
	}

	.campaign-cta {
		margin-top: 1.5rem;
	}

	.cta-button {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		background: white;
		color: var(--brand);
		padding: 1rem 2rem;
		border-radius: 16px;
		text-decoration: none;
		font-weight: 700;
		transition: all 0.3s ease;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
		position: relative;
		overflow: hidden;
	}

	.cta-button::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, transparent 0%, rgba(255, 138, 0, 0.1) 100%);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.cta-button:hover::before {
		opacity: 1;
	}

	.cta-button:hover {
		transform: translateY(-5px);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
	}

	.cta-text {
		font-size: 1.2rem;
		font-weight: 800;
	}

	.cta-subtitle {
		font-size: 0.9rem;
		color: rgba(255, 138, 0, 0.7);
		font-weight: 500;
	}

	/* PDF Thumbnail Styles */
	.pdf-thumbnail {
		display: block;
		width: 150px;
		height: auto;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
		text-decoration: none;
	}

	.pdf-thumbnail:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
	}

	.pdf-thumbnail-image {
		width: 100%;
		height: auto;
		display: block;
		aspect-ratio: 8.5 / 11; /* Standard US Letter aspect ratio */
		object-fit: cover;
	}

	.pdf-info {
		padding: 0.75rem;
		background: var(--bg);
		border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
		border-radius: 8px;
	}

	.pdf-title {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text);
		display: block;
	}

	/* Organization Cards */
	.organization-card {
		background: white;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 12px;
		padding: 1.5rem;
		text-decoration: none;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		min-height: 120px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	@media (prefers-color-scheme: dark) {
		.organization-card {
			background: #1a1a1a;
			border-color: rgba(255, 255, 255, 0.1);
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		}
	}

	.organization-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
		border-color: var(--brand);
	}

	.organization-logo {
		max-width: 100%;
		max-height: 60px;
		height: auto;
		object-fit: contain;
	}

	.organization-name {
		font-weight: 600;
		color: var(--text);
		text-align: center;
		line-height: 1.3;
	}

	/* Contact Section */
	.contact-section {
		background: var(--bg);
		padding: 2rem 0;
		border-top: 1px solid var(--brand);
		opacity: 0.9;
	}

	.contact-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
		text-align: center;
	}

	.contact-text {
		font-size: 0.9rem;
		color: var(--text);
		opacity: 0.7;
		margin: 0;
	}

	.contact-link {
		color: var(--brand);
		text-decoration: none;
		font-weight: 500;
	}

	.contact-link:hover {
		text-decoration: underline;
	}

	@media (max-width: 768px) {
		.contact-section {
			padding: 1.5rem 0;
		}

		.contact-container {
			padding: 0 1rem;
		}

		.contact-text {
			font-size: 0.85rem;
		}
	}

	/* Extra small screens (phones in portrait) */
	@media (max-width: 480px) {
		.letter-container {
			padding: 0 0.75rem;
		}

		.letter-content {
			padding: 1.5rem 1rem;
			border-radius: 12px;
		}

		.letter-header-info {
			flex-direction: column;
			gap: 1rem;
			padding: 1rem;
		}

		.letter-body {
			font-size: 0.9rem;
		}

		.commitments {
			padding: 1rem;
		}

		.commitments li {
			padding-left: 0;
			font-size: 0.9rem;
			display: flex;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.commitments li::before {
			position: static;
			width: 1.5rem;
			height: 1.5rem;
			font-size: 0.8rem;
			flex-shrink: 0;
		}

		.demands {
			padding: 1.25rem 0.75rem;
		}

		.demands p {
			font-size: 0.95rem;
		}

		.demands li {
			padding-left: 0;
			font-size: 0.9rem;
			margin-bottom: 1rem;
			line-height: 1.6;
			display: flex;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.demands li::before {
			position: static;
			width: 1.5rem;
			height: 1.5rem;
			font-size: 0.85rem;
			flex-shrink: 0;
		}

		.emphasis {
			padding: 1rem;
			font-size: 0.95rem;
		}
	}
</style>
