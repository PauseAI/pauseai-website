<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'

	const STRIPE_PAYMENT_LINK_BASE_URL = 'https://buy.stripe.com/aFadR9dAleJe3wO95ed7q00'
	const INTERNAL_REDIRECT_PATH = '/'

	onMount(() => {
		const url = $page.url
		const params = new URLSearchParams(url.search)
		const redirectToPayment = params.get('payment') === 'true'

		if (redirectToPayment) {
			// Construct Stripe payment link with remaining parameters
			params.delete('payment')
			const stripePaymentLink = `${STRIPE_PAYMENT_LINK_BASE_URL}?${params.toString()}`
			window.location.href = stripePaymentLink
		} else {
			// Redirect to internal page without query parameters
			goto(INTERNAL_REDIRECT_PATH)
		}
	})
</script>

<h1>Processing your request...</h1>
