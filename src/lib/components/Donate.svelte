<script>
	import PayPal from '$assets/PayPal.svg?url'
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'

	const WIDTH = 256
	const ASPECT_RATIO = 45.67 / 11.69 // from viewBox property

	const height = WIDTH / ASPECT_RATIO
</script>

<div>
	<LinkWithoutIcon
		href="https://www.paypal.com/donate/?hosted_button_id=4TWZXY62EM5VE"
		class="donate-link"
	>
		<img src={PayPal} alt="Donate now" width="256" {height} />
	</LinkWithoutIcon>
</div>

<style>
	div {
		display: flex;
		justify-content: center;
	}

	* :global(.donate-link) {
		transition: 0.1s;
	}

	* :global(.donate-link):hover {
		transform: scale(1.05);
	}

	* :global(.donate-link):active {
		opacity: 0.9;
	}
</style>
