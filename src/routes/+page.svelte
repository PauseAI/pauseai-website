<script lang="ts">
	import Block from '$lib/components/Block.svelte'
	import Mark from '$lib/components/Mark.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { t } from '$lib/translations'

	$: title = $t('home.title')
	$: description = $t('home.description')
	$: blocks = [
		{
			title: $t('home.blocks.0.title'),
			content: $t('home.blocks.0.content'),
			linkText: $t('home.blocks.0.linkText'),
			href: $t('home.blocks.0.href')
		},
		{
			title: $t('home.blocks.1.title'),
			content: $t('home.blocks.1.content'),
			linkText: $t('home.blocks.1.linkText'),
			href: $t('home.blocks.1.href')
		},
		{
			title: $t('home.blocks.2.title'),
			content: $t('home.blocks.2.content'),
			linkText: $t('home.blocks.2.linkText'),
			href: $t('home.blocks.2.href')
		},
		{
			title: $t('home.blocks.3.title'),
			content: $t('home.blocks.3.content'),
			linkText: $t('home.blocks.3.linkText'),
			href: $t('home.blocks.3.href')
		},
		{
			title: $t('home.blocks.4.title'),
			content: $t('home.blocks.4.content'),
			linkText: $t('home.blocks.4.linkText'),
			href: $t('home.blocks.4.href')
		}
	]
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
