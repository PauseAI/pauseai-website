import { listItemParts, type EmailBlock } from './blocks.js'
import type { ChapterLink, OnboardingEmailLanguage } from './types.js'
import { ADDRESS_LINE } from './fixed.js'
import { escapeHtml, mdLineToHtml } from './markdown.js'

// A deliberately plain alternative to html.ts: no card, no colours, no column and no
// typography of its own. The markup is what Gmail itself writes for a hand-typed email
// (paragraphs, bold, lists, bare links), so every mail client shows it in its own default
// font, left-aligned and wrapping to the reading pane. Consumes the exact same blocks/copy
// as the rich renderer.

function renderBlock(block: EmailBlock): string {
	switch (block.type) {
		case 'heading':
			// Not a display heading — just a bold lead-in line, in the body flow.
			return `<p><strong>${mdLineToHtml(block.text)}</strong></p>`
		case 'paragraph':
			return `<p>${mdLineToHtml(block.text)}</p>`
		case 'list': {
			const items = block.items
				.map((item) => {
					const { text, items: sub } = listItemParts(item)
					const nested = sub.length
						? `<ul>${sub.map((subItem) => `<li>${mdLineToHtml(subItem)}</li>`).join('')}</ul>`
						: ''
					return `<li>${mdLineToHtml(text)}${nested}</li>`
				})
				.join('')
			const tag = block.ordered ? 'ol' : 'ul'
			return `<${tag}>${items}</${tag}>`
		}
		case 'button':
			// The plain layout reads as a typed note, so a button would be out of place.
			return `<p>${mdLineToHtml(`[${block.text}](${block.url})`)}</p>`
		case 'signoff':
			return `<p>${block.lines.map((line) => mdLineToHtml(line)).join('<br>')}</p>`
		case 'rule':
			return ''
		case 'links':
			return `<p>${linkRow(block.items)}</p>`
	}
}

/** Anchors separated by bars, the way PauseAI UK writes its own footer. */
function linkRow(items: ChapterLink[]): string {
	return items
		.map((item) => `<a href="${escapeHtml(item.url)}">${escapeHtml(item.label)}</a>`)
		.join(' | ')
}

/** Plain-text-feel HTML wrapper: a bare left-aligned block, styled by the mail client
 *  rather than by us. A small PauseAI wordmark sits at the foot, above the address line,
 *  the same placement as the pre-migration PauseAI UK template. `assetBaseUrl` must be
 *  absolute (email clients don't resolve relative paths). */
export function renderHtmlPlain(
	blocks: EmailBlock[],
	language: OnboardingEmailLanguage,
	assetBaseUrl: string,
	socials: ChapterLink[] = []
): string {
	const body = blocks.map(renderBlock).join('\n')
	const socialRow = socials.length ? `<p>${linkRow(socials)}</p>` : ''
	const logo = `<p><img src="${assetBaseUrl}/pauseai-logo-email.png" width="180" alt="PauseAI" style="display: block; width: 180px; max-width: 60%; height: auto; border: 0;"></p>`

	return `<!doctype html>
<html lang="${language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PauseAI</title>
</head>
<body>
<div>
${body}
${logo}
${socialRow}
<p>${escapeHtml(ADDRESS_LINE)}</p>
</div>
</body>
</html>`
}
