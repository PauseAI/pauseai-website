<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import mapboxgl from 'mapbox-gl'
	const { Map, GeolocateControl, Popup, Marker } = mapboxgl
	import '../../../node_modules/mapbox-gl/dist/mapbox-gl.css'
	import { communities, communitiesMeta } from './communities'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import ExternalLink from '$lib/components/custom/a.svelte'

	let { title, description, date } = communitiesMeta

	let map: mapboxgl.Map
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

	onMount(() => {
		const initialState = { lng: lng, lat: lat, zoom: zoom }

		map = new Map({
			container: mapContainer,
			projection: { name: 'globe' },
			accessToken:
				'pk.eyJ1Ijoiam9lcGlvIiwiYSI6ImNqbTIzanZ1bjBkanQza211anFxbWNiM3IifQ.2iBrlCLHaXU79_tY9SVpXA',
			style: `mapbox://styles/mapbox/outdoors-v11`,
			center: [initialState.lng, initialState.lat],
			zoom: initialState.zoom
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
					color: community.adjacent ? 'rgba(0,0,0,.5)' : 'rgb(255, 148, 22)'
				})
					.setPopup(
						new Popup({ offset: [0, -15] }).setHTML(
							`<h3><a href="${community.link || 'https://discord.gg/HWcPt5ccJN'}">${
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
<p>{description}</p>
<p>
	Do you want to add your location or a community? <ExternalLink
		href="https://discord.gg/HWcPt5ccJN">Create a post</ExternalLink
	> on our discord!
</p>
<div>
	<div class="map-wrap">
		<div class="map" bind:this={mapContainer} />
	</div>
</div>

<style>
	.map-wrap {
		position: relative;
		padding-bottom: 56.25%; /* 16:9 */
		overflow: hidden;
	}

	.map {
		position: absolute;
		width: 100%;
		height: 100%;
	}
</style>
