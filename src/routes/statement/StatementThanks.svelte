<script lang="ts">
	import Link from '$lib/components/Link.svelte'
</script>

<p>Thank you for your signature!</p>
<p class="verify">
	Please check out your email inbox (and spam folder) to verify your email address!
</p>
<!-- Shown to everyone, as saying it only to repeat signers would reveal who has signed. -->
<p>
	Already signed and need to change something, such as becoming anonymous? Email
	<Link href="mailto:contact@pauseai.info">contact@pauseai.info</Link>, as signing again won't
	update it.
</p>

<style>
	.verify {
		font-weight: bold;
	}
</style>
