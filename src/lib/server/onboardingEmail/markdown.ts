// Minimal markdown support: `[label](url)` links, matching the style already used in the
// existing MailerSend templates' `plain_text` fields (see email-templates/*.json),
// `**bold**` and `*italic*`. Plain text output keeps the link syntax verbatim; HTML output
// converts all three. A newline inside a block's text is a line break: HTML output writes a
// <br>, plain text keeps the newline.

const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g
const BOLD_PATTERN = /\*\*([^*]+)\*\*/g
// Runs after the bold pass, so only single asterisks are left for it to pair.
const ITALIC_PATTERN = /\*([^*\n]+)\*/g
// Marks an anchor parked during the emphasis passes. Private-use character: it cannot appear in
// copy, and escapeHtml has already run by the time one is written.
const ANCHOR_MARK = '\uE000'
const ANCHOR_PATTERN = /\uE000(\d+)\uE000/g

/** Plain text has no bold or italics, and the templates' own plain text carried no markers. */
export function stripEmphasis(text: string): string {
	return text.replace(BOLD_PATTERN, '$1').replace(ITALIC_PATTERN, '$1')
}

/** For values a signup typed, interpolated into copy: without this a first name like
 *  `[Verify here](https://…)` would render as a link, in an email that is also CC'd to the
 *  chapter's onboarder. */
export function stripMarkdown(text: string): string {
	return text.replace(/[[\]*]/g, '')
}

export function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
}

/**
 * Escapes `text` for safe HTML output, then converts `[label](url)` markdown
 * links into `<a>` tags and newlines into `<br>`. The URL itself is escaped but not
 * otherwise validated — callers control every URL that reaches this (chapter links,
 * static copy). Links are coloured `linkColor`, or left to the mail client's default
 * when it is omitted.
 */
export function mdLineToHtml(text: string, linkColor?: string): string {
	const anchors: string[] = []
	// Anchors are parked while the emphasis passes run: a chapter's URL is free text and one
	// containing `*` would otherwise have a <strong> or <em> written into its href.
	const parked = escapeHtml(text).replace(LINK_PATTERN, (match, label: string, url: string) => {
		// Chapter links come from a free-text Airtable field and are spliced into this copy, so
		// a value can arrive carrying its own markdown. Anything that is not a plain web or mail
		// link is left as text rather than written into an href.
		if (!/^(https?:|mailto:)/i.test(url)) return match
		const style = linkColor ? ` style="color: ${linkColor}; text-decoration: underline;"` : ''
		anchors.push(`<a href="${url}"${style}>${label}</a>`)
		return `${ANCHOR_MARK}${anchors.length - 1}${ANCHOR_MARK}`
	})
	return parked
		.replace(BOLD_PATTERN, '<strong>$1</strong>')
		.replace(ITALIC_PATTERN, '<em>$1</em>')
		.replace(ANCHOR_PATTERN, (_match, index: string) => anchors[Number(index)])
		.replace(/\n/g, '<br>')
}
