import type { OnboardingEmailLanguage } from './types.js'
import type { EmailBlock } from './blocks.js'
import type { ChapterLink } from './types.js'
import { ADDRESS_LINE } from './fixed.js'
import { escapeHtml, mdLineToHtml } from './markdown.js'

// Matches the site's brand orange (--hero-orange in src/styles/styles.css), also the
// accent color used throughout the existing MailerSend template exports.
const ACCENT = '#ff9416'
const TEXT = '#222222'
const MUTED = '#6b6b6b'
const BORDER = '#e5e5e5'
// The rule colour the MailerSend templates use around their verification block.
const RULE = '#d1d3d3'
const BODY_BG = '#f6f6f6'
const CARD_BG = '#ffffff'

// static/email-social/<name>.png, the same icons the MailerSend templates carry. A label
// with no icon of its own falls back to its text, so nothing disappears.
const SOCIAL_ICONS = new Set([
	'youtube',
	'discord',
	'instagram',
	'x',
	'bluesky',
	'tiktok',
	'facebook'
])

function renderBlock(block: EmailBlock): string {
	switch (block.type) {
		case 'heading': {
			// The templates this replaces set the title at 26px and everything else at 16px.
			const title = block.level === 1
			const size = title ? '26px' : '20px'
			const space = title ? '4px 0 10px 0' : '26px 0 8px 0'
			// The templates set the name itself in the brand orange in their title. This runs on
			// rendered HTML, so a title carrying a link whose URL contains the name would get a
			// span inside its href: titles stay link-free.
			const text = title
				? mdLineToHtml(block.text, ACCENT).replaceAll(
						'PauseAI',
						`<span style="color: ${ACCENT};">PauseAI</span>`
					)
				: mdLineToHtml(block.text, ACCENT)
			return `<tr><td style="padding: ${space}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: ${size}; font-weight: 700; line-height: 1.25; color: ${TEXT};">${text}</td></tr>`
		}
		case 'paragraph':
			return `<tr><td style="padding: 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: ${TEXT};">${mdLineToHtml(block.text, ACCENT)}</td></tr>`
		case 'list': {
			const items = block.items
				.map(
					(item) =>
						`<li style="margin: 0 0 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: ${TEXT};">${mdLineToHtml(item, ACCENT)}</li>`
				)
				.join('')
			const tag = block.ordered ? 'ol' : 'ul'
			return `<tr><td style="padding: 6px 0;"><${tag} style="margin: 0; padding-left: 20px;">${items}</${tag}></td></tr>`
		}
		case 'button':
			// Table + VML wrapper is what makes a button survive Outlook, and matches the
			// MailerSend templates' own button.
			return `<tr><td align="center" style="padding: 14px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td align="center" bgcolor="${ACCENT}" style="border-radius: 28px;"><a href="${escapeHtml(block.url)}" style="display: inline-block; padding: 13px 30px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 28px;">${escapeHtml(block.text)}</a></td></tr></table></td></tr>`
		case 'signoff':
			return `<tr><td style="padding: 22px 0 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: ${TEXT};">${block.lines.map((line) => mdLineToHtml(line, ACCENT)).join('<br>')}</td></tr>`
		case 'rule':
			return `<tr><td style="padding: 12px 0;"><div style="border-top: 1px solid ${RULE}; font-size: 0; line-height: 0;">&nbsp;</div></td></tr>`
		case 'links': {
			// Sits directly under the sentence that introduces it, so the gap above is small and
			// the one below separates it from what follows. The links wrap as a block of chips
			// rather than a middot-joined run-on, which is what a long row of them looked like.
			const links = block.items
				.map(
					(item) =>
						`<a href="${escapeHtml(item.url)}" style="display: inline-block; margin: 0 18px 6px 0; color: ${ACCENT}; text-decoration: underline; white-space: nowrap;">${escapeHtml(item.label)}</a>`
				)
				.join('')
			return `<tr><td style="padding: 2px 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.4;">${links}</td></tr>`
		}
	}
}

/** Hand-rolled table-based HTML, matching the general inline-styles/table-layout
 *  approach of the existing MailerSend exports (email-templates/*.json) rather than
 *  modern CSS, for email-client compatibility. The logo is the PauseAI icon the
 *  MailerSend templates carry; its alt text keeps the name visible where images are
 *  blocked. */
export function renderHtml(
	blocks: EmailBlock[],
	language: OnboardingEmailLanguage,
	assetBaseUrl: string,
	socials: ChapterLink[] = []
): string {
	const rows = blocks.map(renderBlock).join('')
	const socialRow = socials.length
		? `<tr><td align="center" style="padding: 0 0 12px 0; line-height: 1;">${socials
				.map((item) => {
					const slug = item.label.toLowerCase()
					const href = escapeHtml(item.url)
					if (!SOCIAL_ICONS.has(slug))
						return `<a href="${href}" style="display: inline-block; margin: 0 6px; color: ${MUTED}; font-size: 12px; text-decoration: underline;">${escapeHtml(item.label)}</a>`
					return `<a href="${href}" style="display: inline-block; margin: 0 5px;"><img src="${assetBaseUrl}/email-social/${slug}.png" width="18" height="18" alt="${escapeHtml(item.label)}" style="display: block; width: 18px; height: 18px; border: 0;"></a>`
				})
				.join('')}</td></tr>`
		: ''

	return `<!doctype html>
<html lang="${language}">
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
<td style="padding: 28px 32px 20px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
<img src="${assetBaseUrl}/pauseai-icon-email.png" width="60" height="60" alt="PauseAI" style="display: block; width: 60px; height: 60px; border: 0; color: ${ACCENT}; font-size: 14px; font-weight: 800;">
</td>
</tr>
<tr>
<td style="padding: 0 32px 10px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${rows}
</table>
</td>
</tr>
<tr>
<td style="padding: 20px 32px 28px 32px; border-top: 1px solid ${BORDER};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${socialRow}
<tr>
<td align="center" style="padding: 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; line-height: 1.6; color: ${MUTED};">${escapeHtml(ADDRESS_LINE)}</td>
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
