<script lang="ts">
	import Block from '$lib/components/Block.svelte'
	import Mark from '$lib/components/Mark.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { t } from '$lib/translations'

	$: title = $t('home.title')
	$: description = $t('home.description')
	$: blocks = $t('home.blocks')
</script>

<PostMeta {title} {description} />

<section>
	{#each blocks as block}
		<Block linkText={block.linkText} href={block.href}>
			<span slot="title">{@html block.title}</span>
			{block.content}
		</Block>
	{/each}
</section>
