/** @type {import('@eslint/markdown').MarkdownRuleDefinition} */
const noEmptyLinkText = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow links without link text in markdown',
			recommended: true
		},
		messages: {
			emptyLinkText: 'Link is missing link text: {{url}}'
		},
		schema: []
	},
	create(context) {
		return {
			link(node) {
				// Check if the link has no text content or only whitespace
				const isEmpty =
					!node.children ||
					node.children.length === 0 ||
					node.children.every(
						(child) =>
							child.type === 'text' && typeof child.value === 'string' && child.value.trim() === ''
					)

				if (isEmpty) {
					context.report({
						node,
						messageId: 'emptyLinkText',
						data: {
							url: node.url
						}
					})
				}
			}
		}
	}
}

export default /** @type {import('eslint').ESLint.Plugin} */ ({
	rules: {
		'no-empty-link-text': noEmptyLinkText
	}
})
