<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import Scorecard from '$lib/components/Scorecard.svelte'
	import { meta } from './meta'

	let { title, description, date } = meta
</script>

<PostMeta {title} {description} {date} />

<h1>{title}</h1>
<p>AI Companies are building some of the most impactful technology in the world.</p>
<Scorecard />
