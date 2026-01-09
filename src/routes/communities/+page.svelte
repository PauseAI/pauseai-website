<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import Link from '$lib/components/Link.svelte'
	import CommunitiesList from './CommunitiesList.svelte'
	import type { GeoApiResponse } from '$api/geo/+server'
	import type * as maplibregl from 'maplibre-gl'
	import { GeolocateControl, Map, Marker, Popup } from 'maplibre-gl'
	import 'maplibre-gl/dist/maplibre-gl.css'
	import { isMapboxURL, transformMapboxUrl } from 'maplibregl-mapbox-request-transformer'
	import { onDestroy, onMount } from 'svelte'
	import { communities, communitiesMeta } from './communities'
	import { MAPBOX_KEY } from './constants'

	export let data

	const LOCATED_ZOOM = 4

	let { title, description, date } = communitiesMeta

	let map: maplibregl.Map
	let mapContainer: HTMLDivElement
	let lng: number
	let lat: number
	let zoom: number

	lng = -71.224518
	lat = 42.213995
	zoom = 1

	function updateData() {
		zoom = map.getZoom()
		lng = map.getCenter().lng
		lat = map.getCenter().lat
	}

	async function fetchUserLocation() {
		try {
			const response = await fetch('/api/geo')
			if (response.ok) {
				const geoData: GeoApiResponse = await response.json()
				return {
					userLng: geoData.longitude,
					userLat: geoData.latitude
				}
			} else {
				console.error('Failed to fetch user location:', response.statusText)
			}
		} catch (error) {
			console.error('Error fetching user location:', error)
		}
		return {}
	}

	onMount(async () => {
		const { userLng, userLat } = await fetchUserLocation()

		const initialState = {
			lng: userLng || lng,
			lat: userLat || lat,
			zoom: userLat && userLng ? LOCATED_ZOOM : zoom
		}

		map = new Map({
			container: mapContainer,
			style: {
				...data.style,
				projection: {
					type: 'globe'
				}
			},
			center: [initialState.lng, initialState.lat],
			zoom: initialState.zoom,
			transformRequest: (url, resourceType) => {
				if (isMapboxURL(url)) return transformMapboxUrl(url, resourceType ?? '', MAPBOX_KEY)
			}
		})

		map.addControl(
			new GeolocateControl({
				fitBoundsOptions: {
					maxZoom: 4
				},
				positionOptions: {
					enableHighAccuracy: true
				},
				// When active the map will receive updates to the device's location as it changes.
				trackUserLocation: true
			})
		)

		map.on('move', () => {
			updateData()
		})

		map.on('load', () => {
			communities.map((community) => {
				new Marker({
					color:
						community.type === 'adjacent'
							? 'rgba(0,0,0,.5)'
							: community.type === 'national'
								? 'rgb(0, 150, 255)'
								: 'rgb(255, 148, 22)',
					opacityWhenCovered: '0'
				})
					.setPopup(
						new Popup({ offset: [0, -15] }).setHTML(
							`<h3><a href="${community.link || 'https://discord.gg/CR5u5BTBwy'}">${
								community.name
							}</a></h3>`
						)
					)
					.setLngLat([community.lon, community.lat])
					.addTo(map)
			})
		})
	})

	onDestroy(() => {
		map?.remove()
	})
</script>

<PostMeta {title} {description} {date} />

<h1>{title}</h1>
<p>
	PauseAI Global has chapters and communities across the world. These communities are groups of
	individuals that care about the future and agree a <Link href="/proposal"
		>pause is the solution</Link
	>. They work together to educate members of the public and their political representatives about
	the <Link href="/risks">risks</Link>.
</p>

<p>
	If you're looking for a group closer to home, check out our map below to find the people nearest
	to you. The map also includes adjacent AI Safety communities in grey.
</p>
<div>
	<div class="map-wrap">
		<div class="map" bind:this={mapContainer} />
	</div>
</div>
<CommunitiesList {communities} />

<p>
	Can't find a community near you and want to lead the way? Learn how to do it <Link
		href="/national-groups#how-to-set-up-a-pauseai-national-group">here</Link
	>.
</p>

<h2>Events</h2>

<p>Interested in attending a PauseAI community event? Find one below.</p>

<iframe
	src="https://lu.ma/embed/calendar/cal-E1qhLPs5IvlQr8S/events?"
	height="450"
	frameborder="0"
	style="border: 1px solid #bfcbda88; border-radius: 24px; width: 100%;"
	allowfullscreen
	aria-hidden="false"
	title="PauseAI Events Calendar"
></iframe>

<p>
	Find the full list of events <Link href="https://lu.ma/PauseAI">here</Link>.
</p>

<p>
	If you want to organize an event, please create an event on Luma and press the "submit event"
	button on <Link href="https://lu.ma/PauseAI">our calendar page</Link>.
</p>

<style>
	.map-wrap {
		position: relative;
		padding-bottom: 56.25%; /* 16:9 */
		overflow: hidden;
		border-radius: 24px;
		border: 1px solid var(--text-subtle);
	}

	.map {
		position: absolute;
		width: 100%;
		height: 100%;
	}

	:global(.maplibregl-ctrl-group) {
		border-radius: 24px !important;
		border: 1px solid var(--text-subtle) !important;
		overflow: hidden;
	}

	:global(.maplibregl-ctrl-group button) {
		border-radius: 0 !important;
	}

	:global(.maplibregl-ctrl-group button:first-child) {
		border-top-left-radius: 24px !important;
		border-top-right-radius: 24px !important;
	}

	:global(.maplibregl-ctrl-group button:last-child) {
		border-bottom-left-radius: 24px !important;
		border-bottom-right-radius: 24px !important;
	}
</style>
