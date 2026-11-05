import { ADDRESS_LINE } from './fixed.js'
import { stripEmphasis } from './markdown.js'
import type { EmailBlock } from './blocks.js'
import type { ChapterLink, UnsubscribeLine } from './types.js'

/** Renders blocks + footer to plain text, matching the `[label](url)` markdown-link
 *  style already used in the existing templates' `plain_text` fields. */
export function renderText(
	blocks: EmailBlock[],
	socials: ChapterLink[] = [],
	unsubscribe?: UnsubscribeLine
): string {
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
						.map((item, i) => `${block.ordered ? `${i + 1}.` : '-'} ${stripEmphasis(item)}`)
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
	if (unsubscribe) {
		parts.push(`${unsubscribe.question} [${unsubscribe.linkText}](${unsubscribe.url}).`)
	}
	parts.push(ADDRESS_LINE)

	return parts.join('\n\n')
}
