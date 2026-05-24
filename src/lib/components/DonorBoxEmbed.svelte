<script lang="ts">
	import { onMount } from 'svelte'
	import { getLocale } from '$lib/paraglide/runtime'

	interface Props {
		/** DonorBox campaign slug (required) */
		campaignSlug: string
		/** iframe height in pixels */
		height?: number
		/** Whether to enable PayPal Express in the widget */
		paypalExpress?: boolean
	}

	let { campaignSlug, height = 685, paypalExpress = true }: Props = $props()

	const locale = getLocale()
	let embedSrc = $derived(
		`https://donorbox.org/embed/${campaignSlug}?hide_donation_meter=true&language=${locale}`
	)

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
