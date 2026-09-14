<script lang="ts">
	import { onMount } from 'svelte'
	import {
		loadTurnstile,
		TURNSTILE_FIELD,
		turnstileSiteKey,
		type TurnstileApi
	} from '$lib/turnstile'

	// Tokens are single-use and expire after five minutes, so the parent remounts
	// this component (via a {#key} block) after every submission.
	let { token = $bindable('') }: { token: string } = $props()

	let container = $state<HTMLDivElement | undefined>(undefined)
	let failed = $state(false)

	let api: TurnstileApi | undefined
	let widgetId: string | undefined

	onMount(() => {
		const target = container
		if (!turnstileSiteKey || !target) return

		let cancelled = false

		loadTurnstile()
			.then((turnstile) => {
				if (cancelled) return
				api = turnstile
				widgetId = turnstile.render(target, {
					sitekey: turnstileSiteKey,
					theme: 'auto',
					callback: (newToken: string) => {
						token = newToken
						failed = false
					},
					'error-callback': () => {
						token = ''
						failed = true
					},
					'expired-callback': () => {
						token = ''
					}
				})
			})
			.catch((error: unknown) => {
				console.error('Turnstile failed to load:', error)
				failed = true
			})

		return () => {
			cancelled = true
			if (api && widgetId) api.remove(widgetId)
		}
	})
</script>

{#if turnstileSiteKey}
	<div class="turnstile">
		<div bind:this={container}></div>
		{#if failed}
			<p class="turnstile-error">
				The anti-spam check could not load. Please refresh the page and try again.
			</p>
		{/if}
	</div>
{/if}
<input type="hidden" name={TURNSTILE_FIELD} value={token} />

<style>
	.turnstile {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		/* Reserve the widget's height so the form does not jump as it loads. */
		min-height: 65px;
	}

	.turnstile-error {
		margin: 0;
		font-size: 0.9rem;
		color: var(--text);
		opacity: 0.8;
		text-align: center;
	}
</style>
