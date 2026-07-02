<script lang="ts">
	import Link from '$lib/components/Link.svelte'
	import { getMessages } from './i18n.svelte'

	const msgs = $derived(getMessages())
</script>

<ul class="action-cards">
	<li>
		<h3><Link href="/ai-concerns">{msgs.onboarding_action_ai_concerns_title}</Link></h3>
		<p>{msgs.onboarding_action_ai_concerns_sub}</p>
	</li>
	<li>
		<h3><Link href="/email-builder">{msgs.onboarding_action_email_reps_title}</Link></h3>
		<p>{msgs.onboarding_action_email_reps_sub}</p>
	</li>
	<li>
		<h3><Link href="/lobby-tips">{msgs.onboarding_action_lobby_title}</Link></h3>
		<p>{msgs.onboarding_action_lobby_sub}</p>
	</li>
	<li>
		<h3>{msgs.onboarding_action_talk_title}</h3>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<p>{@html msgs.onboarding_action_talk_sub}</p>
	</li>
	<li>
		<h3>
			<Link href="https://microcommit.io/onboarding?org=135fcd8d-8116-44af-b885-14df992f9a8c">
				{msgs.onboarding_action_microcommit_title}
			</Link>
		</h3>
		<p>{msgs.onboarding_action_microcommit_sub}</p>
	</li>
	<li>
		<h3>{msgs.onboarding_action_petitions_title}</h3>
		<p>{msgs.onboarding_action_petitions_sub}</p>
		<ul class="petitions">
			<li><Link href="/statement">PauseAI Statement</Link></li>
			<li><Link href="/sayno">Say No To Superintelligent AI</Link></li>
			<li>
				<Link href="https://superintelligence-statement.org/">Statement on Superintelligence</Link>
			</li>
			<li><Link href="https://aitreaty.org/">International AI Treaty</Link></li>
			<li>
				<Link
					href="https://www.change.org/p/artificial-intelligence-time-is-running-out-for-responsible-ai-development-91f0a02c-130a-46e1-9e55-70d6b274f4df"
				>
					Demand Responsible AI
				</Link>
			</li>
		</ul>
	</li>
	<li>
		<h3>{msgs.onboarding_action_donate_title}</h3>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<p>{@html msgs.onboarding_action_donate_sub}</p>
	</li>
</ul>

<style>
	.action-cards {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.action-cards > li {
		background-color: var(--bg);
		border: 1px solid var(--brand-subtle);
		border-radius: 12px;
		padding: 1rem 1.25rem;
	}

	h3 {
		margin: 0 0 0.25rem 0;
		font-size: 1.1rem;
		font-family: var(--font-heading);
	}

	p {
		margin: 0;
		font-size: 0.95rem;
		opacity: 0.9;
	}

	.petitions {
		margin: 0.5rem 0 0 0;
		padding-left: 1.25rem;
		font-size: 0.95rem;
	}

	.petitions li {
		margin-bottom: 0.25rem;
	}
</style>
