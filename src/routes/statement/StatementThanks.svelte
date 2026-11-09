<script lang="ts">
	import Link from '$lib/components/Link.svelte'
</script>

<div class="panel">
	<div class="icon" aria-hidden="true">✉</div>
	<h3 class="toc-exclude">Thank you for your signature!</h3>
	<p class="verify">
		Please check out your email inbox (and spam folder) to verify your email address!
	</p>
	<!-- Shown to everyone, as saying it only to repeat signers would reveal who has signed. -->
	<p class="note">
		Already signed and need to change something, such as becoming anonymous? Email
		<Link href="mailto:contact@pauseai.info">contact@pauseai.info</Link>, as signing again won't
		update it.
	</p>
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

	h3 {
		font-family: var(--font-heading);
		font-size: 1.6rem;
		margin: 0;
	}

	p {
		max-width: 32rem;
		margin: 1rem auto 0;
	}

	.verify {
		font-weight: bold;
		font-size: 1.1rem;
	}

	.note {
		font-size: 0.9rem;
		color: var(--text-2);
	}
</style>
