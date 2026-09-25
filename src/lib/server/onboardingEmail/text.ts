import { ADDRESS_LINE } from './fixed.js'
import { stripEmphasis } from './markdown.js'
import { listItemParts, type EmailBlock } from './blocks.js'
import type { ChapterLink } from './types.js'

/** Renders blocks + footer to plain text, matching the `[label](url)` markdown-link
 *  style already used in the existing templates' `plain_text` fields. */
export function renderText(blocks: EmailBlock[], socials: ChapterLink[] = []): string {
	const parts: string[] = []

	for (const block of blocks) {
		switch (block.type) {
			case 'heading':
			case 'paragraph':
				parts.push(stripEmphasis(block.text))
				break
			case 'list':
				parts.push(
					block.items
						.map((item, i) => {
							const { text, items } = listItemParts(item)
							const marker = block.ordered ? `${i + 1}.` : '-'
							return [
								`${marker} ${stripEmphasis(text)}`,
								...items.map((sub) => `  - ${stripEmphasis(sub)}`)
							].join('\n')
						})
						.join('\n')
				)
				break
			case 'button':
				parts.push(`[${block.text}](${block.url})`)
				break
			case 'signoff':
				parts.push(block.lines.map(stripEmphasis).join('\n'))
				break
			case 'rule':
				break
			case 'links':
				parts.push(block.items.map((item) => `[${item.label}](${item.url})`).join('\t'))
				break
		}
	}

	if (socials.length) parts.push(socials.map((item) => `[${item.label}](${item.url})`).join('\t'))
	parts.push(ADDRESS_LINE)

	return parts.join('\n\n')
}
