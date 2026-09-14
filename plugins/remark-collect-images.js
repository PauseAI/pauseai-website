/** @typedef {import('mdast').Root} Root */
/** @typedef {import('mdast').Image} Image */
// See docs/image-processing.md for the full image-processing architecture.

import { visit } from 'unist-util-visit'

/**
 * Collects every image URL referenced in the markdown body and stores the
 * deduplicated list on `vFile.data.fm._images`. mdsvex later exports
 * `vFile.data.fm` as `export const metadata = ...`, so the list becomes
 * accessible in SvelteKit `load` functions via `file.metadata._images`.
 *
 * Must run after mdsvex's internal `parse_frontmatter` so `vFile.data.fm`
 * already exists. mdsvex registers its frontmatter plugins before user
 * remark plugins, so any plugin added via `remarkPlugins` runs late enough.
 *
 * Only collects MDAST `image` nodes (markdown `![alt](url)` syntax, including
 * images nested inside links). HTML `<img>` tags and the frontmatter `image`
 * field are not included — the frontmatter `image` is already available as
 * `metadata.image`.
 *
 * @returns {(tree: Root, vFile: { data: { fm?: Record<string, unknown> } }) => void}
 */
export default function remarkCollectImages() {
	return (tree, vFile) => {
		/** @type {string[]} */
		const images = []

		visit(tree, 'image', (/** @type {Image} */ node) => {
			if (typeof node.url === 'string' && node.url) {
				images.push(node.url)
			}
		})

		if (images.length === 0) return

		// Dedupe while preserving order of first occurrence.
		const unique = [...new Set(images)]

		if (!vFile.data.fm) vFile.data.fm = {}
		vFile.data.fm._images = unique
	}
}
