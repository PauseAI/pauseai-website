<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import ExternalLink from '$lib/components/custom/a.svelte'
	import type * as maplibregl from 'maplibre-gl'
	import { GeolocateControl, Map, Marker, Popup } from 'maplibre-gl'
	import 'maplibre-gl/dist/maplibre-gl.css'
	import { isMapboxURL, transformMapboxUrl } from 'maplibregl-mapbox-request-transformer'
	import { onDestroy, onMount } from 'svelte'
	import { communities, communitiesMeta } from './communities'
	import { MAPBOX_KEY } from './constants'

	export let data

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

	onMount(() => {
		const initialState = { lng: lng, lat: lat, zoom: zoom }

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
					color: community.adjacent ? 'rgba(0,0,0,.5)' : 'rgb(255, 148, 22)',
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
<p>{description}</p>
<p>
	Do you want to add your location or a community? <ExternalLink
		href="https://discord.gg/CR5u5BTBwy">Create a post</ExternalLink
	> on our Discord!
</p>
<p>
	Do you want to start a community? Check our <ExternalLink
		href="https://pauseai.info/local-organizing">Guide on local organizing</ExternalLink
	>
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
