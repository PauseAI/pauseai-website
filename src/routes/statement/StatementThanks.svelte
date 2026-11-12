<script lang="ts">
	import Link from '#lib/components/Link.svelte'
	import JoinInvite from './JoinInvite.svelte'

	let {
		/** The heading level that follows the page's own headings. */
		headingLevel = 3,
		/** In the chapter-site iframe, where a link must not replace the form. */
		embedded = false
	}: { headingLevel?: 2 | 3; embedded?: boolean } = $props()
</script>

<div class="panel">
	<div class="icon" aria-hidden="true">✉</div>
	<svelte:element this={`h${headingLevel}`} class="toc-exclude heading"
		>Thank you for signing!</svelte:element
	>
	<p>
		Check your inbox (and spam folder) for our email, and click its link to confirm your signature.
	</p>
	<!-- Shown to everyone, as saying it only to repeat signers would reveal who has signed. -->
	<p class="note">
		Already signed and need to change something, such as becoming anonymous? Email
		<Link href="mailto:contact@pauseai.info">contact@pauseai.info</Link>, as signing again won't
		update it.
	</p>
	<div class="invite">
		<strong>Want to do more?</strong>
		<JoinInvite {embedded} />
	</div>
</div>

<style>
	.panel {
		padding: 2rem 1.5rem;
		background-color: var(--bg);
		border-radius: 20px;
		text-align: center;
	}

	@media (max-width: 600px) {
		.panel {
			padding: 1.5rem 1rem;
		}
	}

	/* Matches the onboarding flow's check-your-inbox icon. */
	.icon {
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 50%;
		background-color: var(--brand);
		color: var(--bg);
		font-size: 2rem;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 1rem auto;
	}

	.heading {
		font-family: var(--font-heading);
		font-size: 1.6rem;
		margin: 0;
	}

	p {
		max-width: 32rem;
		margin: 1rem auto 0;
	}

	.invite {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem 1rem;
		max-width: 32rem;
		margin: 1.5rem auto 0;
		padding: 0.9rem 1.1rem;
		text-align: left;
		background-color: var(--bg-subtle);
		border-radius: 14px;
	}

	.note {
		font-size: 0.9rem;
		color: var(--text-2);
	}

	/* After .invite, so these win. The button doesn't fit beside the question in a narrow
	chapter-site iframe. */
	@media (max-width: 400px) {
		.invite {
			flex-direction: column;
			align-items: flex-start;
			padding: 0.75rem;
		}
	}
</style>
