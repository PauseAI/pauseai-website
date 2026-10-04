<!-- Render only after a submission that carried an email: creating the row is what
     sends the verification email this asks the person to open. -->
<script lang="ts">
	import type { OnboardingMessages } from './messages'

	interface Props {
		msgs: OnboardingMessages
		leadIn?: string
	}

	let { msgs, leadIn = '' }: Props = $props()
</script>

<div class="check-inbox">
	<div class="icon" aria-hidden="true">✉</div>
	<h2>{msgs.onboarding_check_inbox_title}</h2>
	<p>{leadIn ? `${leadIn} ` : ''}{msgs.onboarding_check_inbox_body}</p>
</div>

<style>
	.check-inbox {
		text-align: center;
	}

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

	h2 {
		font-family: var(--font-heading);
		margin: 0;
	}

	p {
		max-width: 32rem;
		margin: 1rem auto;
		font-weight: normal;
	}
</style>
