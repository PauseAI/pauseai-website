import { SKIP, visit } from 'unist-util-visit'
import path from 'path'

export function faqPlugin() {
	return (tree, file) => {
		// Only process the file if it's named faq.md
		if (path.basename(file.filename) !== 'faq.md') {
			return
		}

		let currentAccordion = null
		let accordionCount = 0

		visit(tree, 'element', (node, index, parent) => {
			if (node.tagName === 'h3') {
				// This is a new question, create a new Accordion
				accordionCount++
				currentAccordion = {
					type: 'element',
					tagName: 'Accordion',
					properties: { id: `accordion${accordionCount}` },
					children: [
						{
							type: 'element',
							tagName: 'svelte:fragment',
							properties: { slot: 'head' },
							children: [{ type: 'text', value: node.children[0].value }]
						},
						{
							type: 'element',
							tagName: 'svelte:fragment',
							properties: { slot: 'details' },
							children: []
						}
					]
				}
				// replace current node with the accordion
				parent.children[index] = currentAccordion
			} else if (currentAccordion) {
				// This is content for the current question, add it to the details slot
				currentAccordion.children[1].children.push(node)
				// Then remove the current node
				parent.children.splice(index, 1)
			}
			// Never traverse children, we only need the first level of the tree
			return SKIP
		})
	}
}
