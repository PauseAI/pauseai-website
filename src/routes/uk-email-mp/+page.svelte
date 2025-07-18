<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import UKMPLookup from '$lib/components/UKMPLookup.svelte'
	import * as m from '$lib/paraglide/messages.js'

	const title = m.uk_email_mp_title()
	const description = m.uk_email_mp_description()
	const ukOnlyNotice = m.uk_email_mp_uk_only_notice()

	// We bold the first sentence and wrap the last three words in a link.
	// This works in the original English and is probably close enough in most translations.
	const ukOnlySentence1 = ukOnlyNotice.split('.')[0]
	const ukOnlySentence2 = ukOnlyNotice.split('.')[1]
	const ukOnlySentence2Less3Words = ukOnlySentence2.split(' ').slice(0, -3).join(' ')
	const ukOnlySentence2Last3Words = ukOnlySentence2.split(' ').slice(-3).join(' ')
</script>

<PostMeta {title} {description} />

<div class="header">
	<h1>{title}</h1>
	<em>{description}</em>
</div>

<section class="intro">
	<p>
		<b>{ukOnlySentence1}.</b>
		{ukOnlySentence2Less3Words}
		<a href="/email-builder">{ukOnlySentence2Last3Words}</a>.
	</p>
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
