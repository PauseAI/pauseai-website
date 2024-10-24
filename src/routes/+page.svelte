<script lang="ts">
	import Block from '$lib/components/Block.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'

	import * as m from '$lib/paraglide/messages.js'

	const title = 'We need to Pause AI'
	const description = 'We are risking human extinction. We need to pause AI development, right now.'
</script>

<PostMeta {title} {description} />

<section>
	<Block linkText={m.home_risks_c2a()} href="/risks">
		<span slot="title">{@html m.home_risks_title()}</span>
		{m.home_risks_content()}
	</Block>
	<Block linkText={m.home_xrisk_c2a()} href="/xrisk">
		<span slot="title">{@html m.home_xrisk_title()}</span>
		{m.home_xrisk_content()}
	</Block>
	<Block linkText={m.home_proposal_c2a()} href="/proposal">
		<span slot="title">{@html m.home_proposal_title()}</span>
		{m.home_proposal_content()}
	</Block>
	<Block linkText={m.home_urgency_c2a()} href="/urgency">
		<span slot="title">{@html m.home_urgency_title()}</span>
		{m.home_urgency_content()}
	</Block>
	<Block linkText={m.home_action_c2a()} href="/action">
		<span slot="title">{@html m.home_action_title()}</span>
		{m.home_action_content()}
	</Block>
</section>
