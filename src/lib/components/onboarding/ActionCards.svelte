<script lang="ts">
	import Link from '$lib/components/Link.svelte'
</script>

<ul class="action-cards">
	<li>
		<h3><Link href="/ai-concerns">Share your AI concerns</Link></h3>
		<p>Tell your story and add your voice to the public record.</p>
	</li>
	<li>
		<h3><Link href="/email-builder">Email your elected representatives</Link></h3>
		<p>Use our Email Builder for a pre-drafted message you can personalize and send.</p>
	</li>
	<li>
		<h3><Link href="/lobby-tips">Contact your elected officials</Link></h3>
		<p>Our lobby tips walk you through what to say.</p>
	</li>
	<li>
		<h3>Talk to someone in your life about AI safety</h3>
		<p>
			A friend, neighbour, colleague, or family member. Our
			<Link href="/counterarguments">counterarguments guide</Link> can help you answer tough questions
			and encourage others to act.
		</p>
	</li>
	<li>
		<h3>
			<Link href="https://microcommit.io/onboarding?org=135fcd8d-8116-44af-b885-14df992f9a8c">
				Microcommit — weekly bite-sized actions
			</Link>
		</h3>
		<p>Pick from a list of small ongoing actions and track your contribution over time.</p>
	</li>
	<li>
		<h3>Sign the petitions</h3>
		<p>Add your name alongside thousands of others calling for safer AI.</p>
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
		<h3>Donate or pick up some gear</h3>
		<p>
			Make a <Link href="/donate">donation</Link> or pick up some gear from our
			<Link href="https://pauseai-shop.fourthwall.com/">store</Link>.
		</p>
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
