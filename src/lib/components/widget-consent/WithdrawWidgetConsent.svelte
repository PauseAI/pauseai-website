<script>
	import consent from '$lib/components/widget-consent/WidgetConsentStore'
	import toast from 'svelte-french-toast'
</script>

<button
	class="button-to-link"
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
