<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import ExternalLink from '$lib/components/custom/a.svelte'
	import consent from '$lib/stores/WidgetConsentStore'
</script>

{#if $consent}
	<slot />
{:else}
	<div class="widget-consent">
		<div class="consent-text">
			By enabling X (Twitter) widgets, you consent to your data being processed in accordance with
			the <ExternalLink href="https://twitter.com/en/privacy">privacy policy of X</ExternalLink>.
		</div>
		<Button on:click={() => ($consent = true)}>Enable X (Twitter) widgets</Button>
	</div>
{/if}

<style>
	.widget-consent {
		display: flex;
		flex-direction: column;
		text-align: center;
		align-items: center;
		padding: 1em;
		border: 3px solid var(--brand);
		border-radius: 3px;
		margin: 1rem 0rem 1rem;
	}

	.consent-text {
		margin: 0rem 0rem 1rem;
	}
</style>
