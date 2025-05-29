<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import Doomers from '$lib/components/Doomers.svelte'
	import { meta } from './meta'
	import Link from '$lib/components/custom/a.svelte'

	let { title, description, date } = meta
</script>

<PostMeta {title} {description} {date} />

<h1>{title}</h1>
<p>
	p(doom) is the probability of very bad outcomes (e.g. human extinction) as a result of AI. This
	most often refers to the likelihood of <Link href="/ai-takeover">AI taking over</Link> from humanity,
	but different scenarios can also constitute "doom". For example, a large portion of the population
	dying due to a novel biological weapon created by AI, social collapse due to a
	<Link href="/cybersecurity-risks">large-scale cyber attack</Link>, or AI causing a nuclear war.
	Note that not everyone is using the same definition when talking about their p(doom) values. Most
	notably the time horizon is often not specified, which makes comparing a bit difficult.
</p>
<em>Press the p(doom) percentage to open the source.</em>
<Doomers />

<h2>Do something about it</h2>
<p>
	However high your p(doom) is, you probably agree that we should not allow AI companies to gamble
	with our future.
	<Link href="/join">Join PauseAI</Link> to prevent them from doing so.
</p>
