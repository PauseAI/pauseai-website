import { MAPBOX_KEY } from '../routes/communities/constants.js'

export type Coordinate = { latitude: number; longitude: number }

function geocodeUrl(searchText: string): string {
	return `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
		searchText
	)}.json?access_token=${MAPBOX_KEY}&limit=10`
}

interface MapboxFeature {
	center: [number, number]
	// Mapbox's 0–1 match confidence for a feature.
	relevance?: number
	text?: string
	place_name?: string
	context?: { id: string; text: string }[]
}

interface MapboxResponse {
	features?: MapboxFeature[]
}

// Below this, Mapbox's own ranking no longer considers the result a
// credible match for what was asked; accepting it risks pins on same-named
// places in other cities. Matches at or above it still vary in precision
// (city vs. rooftop), which consumers already tolerate.
const MIN_RELEVANCE = 0.5
// Ambiguity check: relevance scores how well the query matches *each*
// candidate, so an ambiguity tie (e.g. "náměstí Svobody" in five Czech
// towns) scores near 1.0 across several results of different cities. A
// near-tie is only safe when the runner-up sits in the winner's own
// (larger) municipality — e.g. the same Prague address matched as both the
// street "Mariánské Náměstí 98/1" and the venue "Municipal Library".
const NEAR_TIE_GAP = 0.05

function cityOf(feature: MapboxFeature): string | undefined {
	return feature.context?.find((entry) => entry.id.startsWith('place.'))?.text
}

const geocodeCache = new Map<string, Coordinate | undefined>()

/**
 * Accepts/rejects the top of a single forward response, shared by single and
 * batched callers: results below the relevance threshold or cross-city ties
 * between the top and runner-up are rejected so ambiguous strings produce no
 * coordinate instead of a wrong-city pin.
 */
function pickCoordinate(location: string, data: MapboxResponse): Coordinate | undefined {
	const features = data.features ?? []
	const top = features[0]
	// Mapbox feature centers are [lon, lat].
	const coordinate: Coordinate | undefined =
		top && (top.relevance ?? 0) >= MIN_RELEVANCE
			? { latitude: top.center[1], longitude: top.center[0] }
			: undefined
	if (!coordinate) {
		console.warn(
			`Mapbox geocoding ${
				top ? 'relevance ' + top.relevance + ' below threshold' : 'matched nothing'
			} for "${location}"`
		)
		return undefined
	}
	const runnerUp = features[1]
	if (
		runnerUp &&
		(runnerUp.relevance ?? 0) > (top.relevance ?? 0) - NEAR_TIE_GAP &&
		cityOf(runnerUp) !== cityOf(top)
	) {
		console.warn(
			`Mapbox geocoding ambiguous: "${location}" ties between "${cityOf(top)}" and "${cityOf(
				runnerUp
			)}" (relevances ${top.relevance} / ${runnerUp.relevance}); dropping all matches`
		)
		return undefined
	}
	return coordinate
}

/**
 * Resolves free-form location strings to coordinates through the Mapbox
 * geocoding API. Uncached locations are fetched in one parallel wave
 * (Mapbox v5 has no batch endpoint; v6's batch API serves no numeric
 * relevance, which the ambiguity guard depends on). Results — hits and
 * failures alike — are cached per calendar process, so the repeat occurrences
 * of a recurring event cost nothing and an unresolvable string cannot turn
 * into an API exhaustion loop.
 */
export async function geocodeAll(
	locations: string[]
): Promise<Map<string, Coordinate | undefined>> {
	const results = new Map<string, Coordinate | undefined>()
	const pending = [...new Set(locations)].filter((location) => {
		if (geocodeCache.has(location)) {
			results.set(location, geocodeCache.get(location))
			return false
		}
		return true
	})
	await Promise.all(
		pending.map(async (location) => {
			let coordinate: Coordinate | undefined
			try {
				const response = await fetch(geocodeUrl(location))
				if (response.ok) {
					coordinate = pickCoordinate(location, (await response.json()) as MapboxResponse)
				} else {
					console.warn(`Mapbox geocoding failed with HTTP ${response.status}: "${location}"`)
				}
			} catch (error) {
				console.warn(`Mapbox geocoding failed: "${location}"`, error)
			}
			geocodeCache.set(location, coordinate)
			results.set(location, coordinate)
		})
	)
	return results
}
