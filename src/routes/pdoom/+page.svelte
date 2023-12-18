<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import Doomers from '$lib/components/Doomers.svelte'

	let { title, description, date } = {
		title: 'List of p(doom) values',
		description: 'How likely do AI various researchers believe AI will cause human extinction?',
		date: '2023-12-18'
	}
</script>

<PostMeta {title} {description} {date} />

<h1>{title}</h1>
<p>
	p(doom) is the probability of very bad outcomes (e.g. human extinction) as a result of AI. This
	most often refers to the likelihood of <a href="/ai-takeover">AI taking over</a> from humanity,
	but different scenarios can also constitute "doom". For example, a large portion of the population
	dying due to a novel biological weapon created by AI, social collapse due to a
	<a href="cybersecurity-risks">large-scale cyber attack</a>, or AI causing a nuclear war. Note that
	not everyone is using the same definition when talking about their p(doom) values. Most notably
	the time horizon is often not specified, which makes comparing a bit difficult.
</p>
<Doomers />

<h2>What about yours?</h2>
<p>
	We've built the AI Outcomes App to help you think about how probable the various outcomes from AI
	are.
</p>
<a href="/outcomes">Try it out</a>
