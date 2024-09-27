<script lang="ts">
	import Block from '$lib/components/Block.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { t } from '$lib/translations'

	$: title = $t('home.title')
	$: description = $t('home.description')
	$: blocks = Array.from({ length: 5 }, (_, i) => ({
		title: $t(`home.blocks.${i}.title`),
		content: $t(`home.blocks.${i}.content`),
		linkText: $t(`home.blocks.${i}.linkText`),
		href: $t(`home.blocks.${i}.href`)
	}))
</script>

<PostMeta {title} {description} />

<section>
	<h1>{title}</h1>
	{#each blocks as block}
		<Block linkText={block.linkText} href={block.href}>
			<span slot="title">{@html block.title}</span>
			{@html block.content}
		</Block>
	{/each}
</section>

<style>
	:global(mark) {
		background: transparent;
		position: relative;
	}
	:global(mark)::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: 0.2em;
		width: 100%;
		height: 4px;
		background-color: var(--brand);
	}
</style>
