<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import ExternalLink from '$lib/components/custom/a.svelte'
	import consent from '$lib/components/widget-consent/WidgetConsentStore'
	import loadTwitter from '$lib/components/widget-consent/loadTwitter'

	let wrapper: HTMLDivElement | undefined

	$: {
		if (wrapper) {
			loadTwitter()
			window.twttr?.ready(() => {
				if (wrapper) window.twttr?.load(wrapper)
			})
		}
	}
</script>

{#if $consent}
	<div bind:this={wrapper}>
		<slot />
	</div>
{:else}
	<div class="widget-consent">
		<div class="consent-text">
			By enabling X (Twitter) widgets, you consent to your data being processed in accordance with
			the <ExternalLink href="https://twitter.com/en/privacy">privacy policy of X</ExternalLink>.
		</div>
		<Button
			on:click={() => {
				let wasSet = false
				if ($consent != null) wasSet = true
				$consent = true
				if (wasSet) location.reload()
			}}>Enable X (Twitter) widgets</Button
		>
	</div>
{/if}

<style>
	.widget-consent {
		display: flex;
		flex-direction: column;
		text-align: center;
		align-items: center;
		padding: 1rem;
		border: 3px solid var(--brand);
		border-radius: 3px;
		margin: 1rem 0rem 1rem;
	}

	.consent-text {
		margin: 0rem 0rem 1rem;
	}
</style>
