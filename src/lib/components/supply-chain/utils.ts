import type { Node } from './types'

// Calculate max nodes in any category
export function getMaxNodesInCategory(nodesByCategory: Record<string, Node[]>) {
	return Math.max(...Object.values(nodesByCategory).map((arr) => arr.length))
}

// Helper function to calculate y position based on index in category
export function getYPosition(
	index: number,
	totalInCategory: number,
	containerHeight: number,
	verticalPadding: number
): number {
	const spacing = (containerHeight - 2 * verticalPadding) / (totalInCategory + 1)
	return verticalPadding + (index + 1) * spacing
}

// Helper function to calculate x position with horizontal padding
export function getXPosition(
	fraction: number,
	containerWidth: number,
	horizontalPadding: number
): number {
	return horizontalPadding + fraction * (containerWidth - 2 * horizontalPadding)
}

// Calculate connection points on node edges (in pixels)
export function calculateConnectionPoints(startNode: Node, endNode: Node) {
	const startX = startNode.x ?? 0
	const startY = startNode.y ?? 0
	const endX = endNode.x ?? 0
	const endY = endNode.y ?? 0

	const dx = endX - startX

	// Node total visual width: CSS width (100px) + padding (2*0.5rem=16px) + border (2*2px=4px) = 120px
	// Node visual half width = 60px
	const nodeVisualHalfWidthPx = 60

	const calculatedStartX = startX + Math.sign(dx) * nodeVisualHalfWidthPx
	const calculatedEndX = endX - Math.sign(dx) * nodeVisualHalfWidthPx

	return {
		startX: calculatedStartX,
		startY,
		endX: calculatedEndX,
		endY
	}
}

// Helper to get domain from URL
export function getDomain(link: string): string {
	try {
		return new URL(link).hostname.replace(/^www\./, '')
	} catch {
		return link
	}
}
