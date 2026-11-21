/**
 * Horizontal pixel offsets that set markers sharing exact coordinates side by side, centered on
 * their location, so none hides another. A marker alone at its location gets 0. Only the drawing
 * moves: the coordinates stay true.
 */
export function sharedLocationOffsets(
	points: readonly { lat: number; lon: number }[],
	spacing: number
): number[] {
	const indicesByLocation = new Map<string, number[]>()
	points.forEach(({ lat, lon }, index) => {
		const key = `${lat},${lon}`
		const indices = indicesByLocation.get(key)
		if (indices) indices.push(index)
		else indicesByLocation.set(key, [index])
	})

	const offsets = points.map(() => 0)
	for (const indices of indicesByLocation.values()) {
		indices.forEach((index, position) => {
			offsets[index] = (position - (indices.length - 1) / 2) * spacing
		})
	}
	return offsets
}
