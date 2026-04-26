/** @type {import('@eslint/markdown').MarkdownRuleDefinition} */
const noScriptWithSrc = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow top-level script elements with a src property in markdown',
			recommended: true
		},
		messages: {
			noScriptWithSrc:
				'Top-level script elements with a src property are disallowed as they cause issues during prerendering. Wrap them in a <div> or a component if they are intended as literal HTML.'
		},
		schema: []
	},
	create(context) {
		return {
			html(node) {
				const value = (node.value || '').trim()
				// Only catch if the HTML block starts with <script
				// and contains a src attribute.
				if (value.toLowerCase().startsWith('<script') && /\bsrc\s*=/i.test(value)) {
					context.report({
						node,
						messageId: 'noScriptWithSrc'
					})
				}
			}
		}
	}
}

export default {
	rules: {
		'no-script-with-src': noScriptWithSrc
	}
}
