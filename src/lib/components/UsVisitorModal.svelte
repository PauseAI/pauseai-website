<script lang="ts">
	import { fade } from 'svelte/transition'
	import { browser } from '$app/environment'
	import Backdrop from '$lib/components/Backdrop.svelte'
	import Button from '$lib/components/Button.svelte'
	import { setItem } from '$lib/localStorage'

	interface Props {
		country: string | null
	}

	let { country }: Props = $props()

	const DISMISSED_KEY = 'us_visitor_modal_dismissed'
	const PEOPLE_FOR_A_PAUSE_URL = 'https://peopleforapause.org/'

	function wasDismissed(): boolean {
		if (!browser) return false
		try {
			return localStorage.getItem(DISMISSED_KEY) === 'true'
		} catch {
			return false
		}
	}

	let open = $state(false)

	$effect(() => {
		if (country === 'US' && !wasDismissed()) {
			open = true
		}
	})

	function dismiss() {
		open = false
		setItem(DISMISSED_KEY, 'true')
	}

	function visit() {
		setItem(DISMISSED_KEY, 'true')
		window.location.href = PEOPLE_FOR_A_PAUSE_URL
	}
</script>

{#if open}
	<Backdrop {open} />
	<div
		class="modal-wrapper"
		transition:fade={{ duration: 150 }}
		role="dialog"
		aria-modal="true"
		aria-labelledby="us-visitor-modal-title"
	>
		<div class="modal">
			<p id="us-visitor-modal-title">
				It looks like you're visiting from the US, would you like to visit People for a Pause, our
				partner organization in the US?
			</p>
			<div class="actions">
				<Button onclick={visit}>Yes, People for a Pause</Button>
				<Button subtle onclick={dismiss}>Continue to PauseAI Global</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-wrapper {
		position: fixed;
		inset: 0;
		z-index: 20;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.modal {
		background-color: var(--bg);
		border: 2px solid var(--brand);
		border-radius: 32px;
		box-shadow: 0 4px 20px rgba(var(--black-rgb), 0.1);
		padding: 2rem;
		max-width: 28rem;
		width: 100%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.actions :global(button) {
		flex: 1;
		justify-content: center;
	}
</style>
