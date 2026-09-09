import type { LanguageCopy } from './copy.js'
import type { EmailBlock } from './blocks.js'
import { escapeHtml, mdLineToHtml } from './markdown.js'

// A deliberately plain alternative to html.ts: no card, no rounded corners, no
// wordmark, no coloured accent — one narrow column of text that reads like a note
// somebody typed out. Modelled on the PauseAI UK MailerLite template
// (email-templates/uk-non-volunteering-*.json): 600-ish px table, Helvetica, near
// -black body text, blue links without underline, generous paragraph spacing.
// Consumes the exact same blocks/copy as the rich renderer.

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
		case 'links': {
			const links = block.items
				.map(
					(item) =>
						`<a href="${item.url}" style="color: ${LINK}; text-decoration: none;">${escapeHtml(item.label)}</a>`
				)
				.join('&nbsp;&nbsp;&middot;&nbsp;&nbsp;')
			return `<p style="${P_STYLE}">${links}</p>`
		}
	}
}

/** Plain-text-feel HTML wrapper. Table layout is kept (email-client width control)
 *  but carries no visual styling of its own. A small PauseAI wordmark sits at the
 *  foot, above the unsubscribe/address lines — same placement as the pre-migration
 *  PauseAI UK template. `logoUrl` must be absolute (email clients don't resolve
 *  relative paths); pass '' to omit it. */
export function renderHtmlPlain(
	blocks: EmailBlock[],
	copy: LanguageCopy,
	unsubscribeUrl: string,
	logoUrl: string
): string {
	const body = blocks.map(renderBlock).join('\n')

	const logo = logoUrl
		? `<p style="margin: 24px 0 20px 0;"><img src="${logoUrl}" width="180" alt="PauseAI" style="display: block; width: 180px; max-width: 60%; height: auto; border: 0;"></p>`
		: ''

	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>PauseAI</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
<tr>
<td align="center" style="padding: 24px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px;">
<tr>
<td>
${body}
${logo}
<p style="font-family: ${FONT}; color: ${MUTED}; font-size: 12px; line-height: 1.5; margin: ${logo ? '0' : '28px'} 0 4px 0;">${mdLineToHtml(copy.unsubscribeLine(unsubscribeUrl), MUTED)}</p>
<p style="font-family: ${FONT}; color: ${MUTED}; font-size: 12px; line-height: 1.5; margin: 0;">${escapeHtml(copy.addressLine)}</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`
}
