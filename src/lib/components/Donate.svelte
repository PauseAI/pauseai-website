<script>
	import PayPal from '$assets/PayPal.svg?url'
	import Link from '$lib/components/Link.svelte'

	const WIDTH = 256
	const ASPECT_RATIO = 45.67 / 11.69 // from viewBox property

	const height = WIDTH / ASPECT_RATIO
</script>

<div>
	<Link href="https://www.paypal.com/donate/?hosted_button_id=4TWZXY62EM5VE">
		<img src={PayPal} alt="Donate now" width="256" {height} />
	</Link>
</div>

<style>
	div {
		display: flex;
		justify-content: center;
	}

	:global(a) {
		transition: 0.1s;
	}

	:global(a:hover) {
		transform: scale(1.05);
	}

	:global(a:active) {
		opacity: 0.9;
	}
</style>
