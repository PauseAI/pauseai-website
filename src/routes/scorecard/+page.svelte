<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import Scorecard from './Scorecard.svelte'
	import { meta } from './meta'

	let { title, description, date } = meta
</script>

<PostMeta {title} {description} {date} />

<h1>{title}</h1>
<p>
	AI Companies are building some of the most impactful technology in the world. PauseAI keeps track
	of how responsible these companies are acting, and what they are doing to prevent various <a
		href="/risks">risks</a
	>.
</p>
<p>
	<em
		>This scorecard is a work in progress. Please <a
			href="https://github.com/joepio/pauseai/pull/32">contribute suggestion on github</a
		>!</em
	>
</p>
<Scorecard />
