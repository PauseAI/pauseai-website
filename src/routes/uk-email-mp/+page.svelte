<script lang="ts">
	import MessageWithLink from '$lib/components/MessageWithLink.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import UKMPLookup from '$lib/components/UKMPLookup.svelte'
	import * as m from '$lib/paraglide/messages.js'

	const title = m.uk_email_mp_title()
	const description = m.uk_email_mp_description()
</script>

<PostMeta {title} {description} />

<div class="header">
	<h1>{title}</h1>
	<em>{description}</em>
</div>

<section class="intro">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- static content -->
	<p><MessageWithLink content={m.uk_email_mp_uk_only_notice()} /></p>
</section>

<section class="mp-lookup-section">
	<UKMPLookup />
</section>

<style>
	.header {
		margin-bottom: 2rem;
		text-align: center;
	}

	h1 {
		margin-bottom: 0.5rem;
	}

	em {
		color: var(--text-muted);
	}

	.intro {
		margin: 0 auto 3rem auto;
		text-align: center;
		font-size: 0.9rem;
		line-height: 1.6;
		color: var(--text-muted);
	}
</style>
