<script lang="ts">
	import ExternalLink from '$lib/components/custom/a.svelte'
	import { page } from '$app/stores'

	const BASE_URL = 'https://github.com/PauseAI/pauseai-website/edit/main/src/'

	const markdownFiles = import.meta.glob(`../../posts/**/*.md`)
	const svelteFiles = import.meta.glob('../../routes/**/+page.svelte')

	$: pathname = $page.url.pathname
	let editUrl: string | null = null
	$: {
		editUrl = null
		let relativePath = pathname == '/' ? '../../routes/+page.svelte' : null
		if (!relativePath) {
			const markdownPath = `../../posts${pathname}.md`
			if (markdownFiles[markdownPath]) relativePath = markdownPath
		}
		if (!relativePath) {
			const sveltePath = `../../routes${pathname}/+page.svelte`
			if (svelteFiles[sveltePath]) relativePath = sveltePath
		}

		if (relativePath) {
			const rootPath = relativePath.substring('../../'.length)
			editUrl = BASE_URL + rootPath
		}
	}
</script>

{#if editUrl}
	<ExternalLink href={editUrl}>Edit on GitHub</ExternalLink>
{/if}
