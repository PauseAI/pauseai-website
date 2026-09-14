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
				const value = (node.value || '').replace(/<!--[\s\S]*?-->/g, '')
				const tagRegex = /<(\/?)([a-z0-9-]+)([^>]*?)(\/?)>/gi
				let match
				let depth = 0

				while ((match = tagRegex.exec(value)) !== null) {
					const [_, isClosing, tagName, attr, isSelfClosing] = match
					const lowerTagName = tagName.toLowerCase()

					if (lowerTagName === 'script' && !isClosing) {
						if (depth === 0 && /\bsrc\s*=/i.test(attr)) {
							context.report({
								node,
								messageId: 'noScriptWithSrc'
							})
							break
						}
					}

					if (isClosing) {
						depth = Math.max(0, depth - 1)
					} else if (!isSelfClosing) {
						depth++
					}
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
