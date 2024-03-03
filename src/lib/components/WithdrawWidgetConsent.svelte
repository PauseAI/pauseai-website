<script>
	import consent from '$lib/stores/WidgetConsentStore'
	import toast from 'svelte-french-toast'
</script>

<button
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

<style>
	button {
		border: inherit;
		background: inherit;
		text-align: inherit;
		font: inherit;
		margin: inherit;
		padding: inherit;
		cursor: pointer;
		color: inherit;
	}

	button:hover {
		text-decoration: underline;
	}
</style>
