import type { LanguageCopy } from './copy.js'
import type { EmailBlock } from './blocks.js'

/** Renders blocks + footer to plain text, matching the `[label](url)` markdown-link
 *  style already used in the existing templates' `plain_text` fields. */
export function renderText(
	blocks: EmailBlock[],
	copy: LanguageCopy,
	unsubscribeUrl: string
): string {
	const parts: string[] = []

	for (const block of blocks) {
		switch (block.type) {
			case 'heading':
				parts.push(block.text)
				break
			case 'paragraph':
				parts.push(block.text)
				break
			case 'list':
				parts.push(block.items.map((item) => `- ${item}`).join('\n'))
				break
			case 'links':
				parts.push(block.items.map((item) => `[${item.label}](${item.url})`).join('\t'))
				break
		}
	}

	parts.push(copy.unsubscribeLine(unsubscribeUrl))
	parts.push(copy.addressLine)

	return parts.join('\n\n')
}
