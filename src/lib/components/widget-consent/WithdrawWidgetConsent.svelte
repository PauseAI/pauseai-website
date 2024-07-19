<script lang="ts">
	import consent from '$components/widget-consent/WidgetConsentStore'
	import toast from 'svelte-french-toast'
</script>

<button
	class="button-to-link"
	title="Withdraw consent for social widgets"
	on:click={() => {
		if ($consent) {
			$consent = false
			toast.success('Consent for social widgets withdrawn!')
		} else {
			toast.error('Nothing to withdraw!')
		}
	}}
>
	Withdraw consent
</button>
