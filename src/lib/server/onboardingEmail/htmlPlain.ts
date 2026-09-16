import type { OnboardingEmailLanguage } from './types.js'
import type { EmailBlock } from './blocks.js'
import type { ChapterLink } from './types.js'
import { ADDRESS_LINE } from './fixed.js'
import { escapeHtml, mdLineToHtml } from './markdown.js'

// A deliberately plain alternative to html.ts: no card, no rounded corners, no
// coloured accent, no column — text that sits at the left edge and wraps to the reading
// pane, the way an email typed into Gmail does. Typography from the PauseAI UK MailerLite
// template (email-templates/uk-non-volunteering-*.json): Helvetica, near-black body text,
// blue links, generous paragraph spacing. Consumes the exact same blocks/copy as the rich
// renderer.

const TEXT = '#121212'
const MUTED = '#6b6b6b'
const LINK = '#1966ff'
const FONT = 'Helvetica, Arial, sans-serif'

const P_STYLE = `font-family: ${FONT}; color: ${TEXT}; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;`

function renderBlock(block: EmailBlock): string {
	switch (block.type) {
		case 'heading':
			// Not a big display heading — just a bold lead-in line, in the body flow.
			return `<p style="${P_STYLE} font-weight: 700;">${mdLineToHtml(block.text, LINK)}</p>`
		case 'paragraph':
			return `<p style="${P_STYLE}">${mdLineToHtml(block.text, LINK)}</p>`
		case 'list': {
			const items = block.items
				.map((item) => `<li style="margin: 0 0 8px 0;">${mdLineToHtml(item, LINK)}</li>`)
				.join('')
			const tag = block.ordered ? 'ol' : 'ul'
			return `<${tag} style="font-family: ${FONT}; color: ${TEXT}; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0; padding-left: 20px;">${items}</${tag}>`
		}
		case 'button':
			// The plain layout reads as a typed note, so a button would be out of place.
			return `<p style="${P_STYLE}">${mdLineToHtml(`[${block.text}](${block.url})`, LINK)}</p>`
		case 'signoff':
			return `<p style="${P_STYLE} margin-top: 28px;">${block.lines.map((line) => mdLineToHtml(line, LINK)).join('<br>')}</p>`
		case 'rule':
			return ''
		case 'links': {
			const links = block.items
				.map(
					(item) =>
						`<a href="${escapeHtml(item.url)}" style="display: inline-block; margin: 0 18px 6px 0; color: ${LINK}; text-decoration: none; white-space: nowrap;">${escapeHtml(item.label)}</a>`
				)
				.join('')
			return `<p style="${P_STYLE} margin-bottom: 14px;">${links}</p>`
		}
	}
}

/** Plain-text-feel HTML wrapper: a bare left-aligned block with no width limit and no
 *  centring, so a wide reading pane shows it the way it shows a hand-written email. A
 *  small PauseAI wordmark sits at the foot, above the address line — same placement as
 *  the pre-migration PauseAI UK template. `assetBaseUrl` must be absolute (email clients
 *  don't resolve relative paths). */
export function renderHtmlPlain(
	blocks: EmailBlock[],
	language: OnboardingEmailLanguage,
	assetBaseUrl: string,
	socials: ChapterLink[] = []
): string {
	const body = blocks.map(renderBlock).join('\n')

	const socialRow = socials.length
		? `<p style="font-family: ${FONT}; color: ${MUTED}; font-size: 12px; line-height: 1.5; margin: 0 0 8px 0;">${socials
				.map(
					(item) =>
						`<a href="${escapeHtml(item.url)}" style="color: ${MUTED}; margin-right: 12px;">${escapeHtml(item.label)}</a>`
				)
				.join('')}</p>`
		: ''
	const logo = `<p style="margin: 24px 0 20px 0;"><img src="${assetBaseUrl}/pauseai-logo-email.png" width="180" alt="PauseAI" style="display: block; width: 180px; max-width: 60%; height: auto; border: 0;"></p>`

	return `<!doctype html>
<html lang="${language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>PauseAI</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff;">
<div>
${body}
${logo}
${socialRow}
<p style="font-family: ${FONT}; color: ${MUTED}; font-size: 12px; line-height: 1.5; margin: 0 0 0 0;">${escapeHtml(ADDRESS_LINE)}</p>
</div>
</body>
</html>`
}
