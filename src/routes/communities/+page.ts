import type { StyleSpecification } from 'maplibre-gl'
import { MAPBOX_KEY } from './constants.js'

const STYLE_URL = 'https://api.mapbox.com/styles/v1/mapbox/outdoors-v11?access_token=' + MAPBOX_KEY

export const ssr = false

export async function load({ fetch }) {
	const res = await fetch(STYLE_URL)
	const style = (await res.json()) as StyleSpecification
	return { style }
}
