<script lang="ts">
	import Link from './custom/a.svelte'

	/**
	 * The `content` prop can contain HTML and markdown-style links.
	 * It is only meant for static messages and should not be used for user-generated content.
	 * @example "Hello <strong>world</strong>, visit [Svelte](https://svelte.dev) today!"
	 */
	export let content = ''

	type LinkPart = {
		type: 'link'
		text: string
		href: string
	}

	type HtmlPart = {
		type: 'html'
		content: string
	}

	type Part = LinkPart | HtmlPart

	// Regex to match markdown-style links: [text](url)
	const linkRegex = /\[(.+?)\]\((.+?)\)/g

	/**
	 * Parse the raw string into a sequence of HTML/text and link parts.
	 */
	function parseContent(str: string) {
		const result: Part[] = []
		let lastIndex = 0
		let match

		while ((match = linkRegex.exec(str))) {
			// Push any HTML/text before this match
			if (match.index > lastIndex) {
				result.push({ type: 'html', content: str.slice(lastIndex, match.index) })
			}
			// Push the link part
			result.push({ type: 'link', text: match[1], href: match[2] })
			lastIndex = linkRegex.lastIndex
		}

		// Push any remaining HTML/text
		if (lastIndex < str.length) {
			result.push({ type: 'html', content: str.slice(lastIndex) })
		}

		return result
	}

	// Re-parse whenever content changes
	$: parts = parseContent(content)
</script>

<!-- Render the parsed parts -->
{#each parts as part}
	{#if part.type === 'link'}
		<!-- Render markdown links with the link component -->
		<Link href={part.href}>{part.text}</Link>
	{:else}
		<!-- Render raw HTML segments -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- static content -->
		{@html part.content}
	{/if}
{/each}
