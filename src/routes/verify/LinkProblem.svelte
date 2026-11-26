<script lang="ts">
	import Link from '$lib/components/Link.svelte'

	interface Props {
		reason: 'missing' | 'notFound'
	}

	let { reason }: Props = $props()
</script>

{#if reason === 'missing'}
	<h1>No verification link found</h1>
	<p>
		This page was opened without a verification link. That happens when you reload it or come back
		to it after verifying, or when only part of the link was copied. If you already confirmed, there
		is nothing more to do.
	</p>
{:else}
	<h1>This link is not valid</h1>
	<p>
		We could not match this link to a signup. Only part of it may have been copied, or the signup
		may no longer exist.
	</p>
{/if}
<p>
	If you still need to confirm, open the link from your email again, or
	<Link href="mailto:info@pauseai.info">email us at info@pauseai.info</Link>.
</p>
