<script lang="ts">
	import { onMount } from 'svelte'
	import { getLocale } from '$lib/paraglide/runtime'

	/** DonorBox campaign slug (required) */
	export let campaignSlug: string

	/** iframe height in pixels */
	export let height = 685

	/** Whether to enable PayPal Express in the widget */
	export let paypalExpress = true

	const locale = getLocale()
	$: embedSrc = `https://donorbox.org/embed/${campaignSlug}?hide_donation_meter=true&language=${locale}`

	onMount(() => {
		const script = document.createElement('script')
		script.src = 'https://donorbox.org/widget.js'
		if (paypalExpress) {
			script.setAttribute('paypalExpress', 'true')
		}
		document.body.appendChild(script)

		return () => {
			document.body.removeChild(script)
		}
	})
</script>

<div class="donorbox-container">
	<iframe
		src={embedSrc}
		height="{height}px"
		width="100%"
		style="max-width: 500px; min-width: 310px;"
		seamless
		name="donorbox"
		frameborder="0"
		scrolling="no"
		title="Donation form"
	></iframe>
</div>

<style>
	.donorbox-container {
		display: flex;
		justify-content: center;
		margin: 2rem 0;
	}
</style>
