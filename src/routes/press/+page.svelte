<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import PressCoveragePanel from './PressCoveragePanel.svelte'
	import Link from '$lib/components/Link.svelte'
	import { meta } from './meta'
	import type { PageData } from './$types'

	export let data: PageData

	// Metadata is imported from our custom local meta.ts register
	const { title, description, date } = meta
</script>

<PostMeta {title} {description} {date} />

<article>
	<hgroup>
		<h1>{title || 'Press & Media'}</h1>
	</hgroup>

	<p class="contact-clarification">
		If you want to contact us, use our <Link href="/contact-us?tab=media">Contact form</Link>.
	</p>
	<div class="coverage-section">
		<h2>Media Coverage</h2>
		<PressCoveragePanel coverage={data.coverage} outletOrder={data.outletOrder} />
	</div>

	<div class="prose logo-materials">
		<h2>Logo, materials</h2>
		<p>
			Our logo and other material can be found in
			<a href="https://drive.google.com/drive/folders/1bQ_MZ8giK-Mee4ABkO0BgcFInaXruNpa?usp=sharing"
				>this Google Drive folder</a
			>.
		</p>
		<p>
			If you want to create PauseAI-related material yourself, you can use our brand color
			<em>#FF9416</em> and the fonts <em>Saira Condensed</em> (700), <em>Montserrat Black</em>, and
			<em>Roboto Slab</em> (300, 700).
		</p>
	</div>
</article>

<style>
	article {
		max-inline-size: var(--size-content-3);
		margin-inline: auto;
	}

	h1 {
		text-transform: none;
	}

	hgroup {
		margin-top: 0;
		margin-bottom: 2rem;
	}

	.contact-clarification {
		font-size: 1.1rem;
		margin-bottom: 2.5rem;
	}

	.coverage-section {
		margin-top: 1.5rem;
		margin-bottom: 3.5rem;
	}

	.coverage-section h2 {
		margin-bottom: 0.5rem;
	}
</style>
