import type { LanguageCopy } from './copy.js'
import type { EmailBlock } from './blocks.js'
import { escapeHtml, mdLineToHtml } from './markdown.js'

// Matches the site's brand orange (--hero-orange in src/styles/styles.css), also the
// accent color used throughout the existing MailerSend template exports.
const ACCENT = '#ff9416'
const TEXT = '#222222'
const MUTED = '#6b6b6b'
const BORDER = '#e5e5e5'
const BODY_BG = '#f6f6f6'
const CARD_BG = '#ffffff'

function renderBlock(block: EmailBlock): string {
	switch (block.type) {
		case 'heading':
			return `<tr><td style="padding: 28px 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 19px; font-weight: 700; color: ${TEXT};">${mdLineToHtml(block.text, ACCENT)}</td></tr>`
		case 'paragraph':
			return `<tr><td style="padding: 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: ${TEXT};">${mdLineToHtml(block.text, ACCENT)}</td></tr>`
		case 'list': {
			const items = block.items
				.map(
					(item) =>
						`<li style="margin: 0 0 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: ${TEXT};">${mdLineToHtml(item, ACCENT)}</li>`
				)
				.join('')
			return `<tr><td style="padding: 6px 0;"><ul style="margin: 0; padding-left: 20px;">${items}</ul></td></tr>`
		}
		case 'links': {
			const links = block.items
				.map(
					(item) =>
						`<a href="${item.url}" style="color: ${ACCENT}; text-decoration: underline;">${escapeHtml(item.label)}</a>`
				)
				.join('&nbsp;&nbsp;&middot;&nbsp;&nbsp;')
			return `<tr><td style="padding: 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.8;">${links}</td></tr>`
		}
	}
}

/** Hand-rolled table-based HTML, matching the general inline-styles/table-layout
 *  approach of the existing MailerSend exports (email-templates/*.json) rather than
 *  modern CSS, for email-client compatibility. No logo image is used (avoids a
 *  broken-image risk for a first version) — just a text wordmark. */
export function renderHtml(
	blocks: EmailBlock[],
	copy: LanguageCopy,
	unsubscribeUrl: string
): string {
	const rows = blocks.map(renderBlock).join('')

	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>PauseAI</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BODY_BG};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BODY_BG};">
<tr>
<td align="center" style="padding: 24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: ${CARD_BG}; border-radius: 8px;">
<tr>
<td style="padding: 28px 32px 0 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
<span style="font-size: 20px; font-weight: 800; color: ${ACCENT}; letter-spacing: 0.3px;">PauseAI</span>
</td>
</tr>
<tr>
<td style="padding: 0 32px 24px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${rows}
</table>
</td>
</tr>
<tr>
<td style="padding: 20px 32px 28px 32px; border-top: 1px solid ${BORDER};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td style="padding: 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; line-height: 1.6; color: ${MUTED};">${mdLineToHtml(copy.unsubscribeLine(unsubscribeUrl), MUTED)}</td>
</tr>
<tr>
<td style="padding: 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; line-height: 1.6; color: ${MUTED};">${escapeHtml(copy.addressLine)}</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`
}
