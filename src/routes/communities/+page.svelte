<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import Link from '$lib/components/Link.svelte'
	import CommunitiesList from './CommunitiesList.svelte'
	import type { GeoApiResponse } from '$api/geo/+server'
	import type { CalendarResponse, Event } from '$api/calendar/+server'
	import type { StyleSpecification } from 'maplibre-gl'
	import * as maplibregl from 'maplibre-gl'
	import 'maplibre-gl/dist/maplibre-gl.css'
	import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
	import { isMapboxURL, transformMapboxUrl } from 'maplibregl-mapbox-request-transformer'
	import { onDestroy, onMount } from 'svelte'
	import { communities, communitiesMeta } from './communities'
	import { MAPBOX_KEY } from './constants'
	import { HERO_ORANGE } from '$lib/colors'
	import escape from 'escape-html'

	// maplibre-gl v6 is ESM-only; the worker URL must be set explicitly under
	// bundlers like Vite (see v5→v6 migration guide).
	maplibregl.setWorkerUrl(workerUrl)

	// maplibre-gl doesn't support named imports on the server
	const { GeolocateControl, Map, Marker, Popup } = maplibregl

	const LOCATED_ZOOM = 4
	const STYLE_URL =
		'https://api.mapbox.com/styles/v1/mapbox/outdoors-v11?access_token=' + MAPBOX_KEY

	let { title, description, date } = communitiesMeta

	let map: maplibregl.Map
	let mapContainer: HTMLDivElement
	let lng: number = $state(-71.224518)
	let lat: number = $state(42.213995)
	let zoom: number = $state(1)

	// The map has always shown only the next month of events; the Events list
	// below wants the whole calendar, so the window is applied to the markers
	// rather than to the request.
	const MAP_EVENT_WINDOW_DAYS = 30
	const EVENT_DATE_FORMAT = new Intl.DateTimeFormat('en', {
		weekday: 'short',
		day: 'numeric',
		month: 'long'
	})

	let upcomingEvents: Event[] = $state([])
	let eventsLoaded = $state(false)

	function updateData() {
		zoom = map.getZoom()
		lng = map.getCenter().lng
		lat = map.getCenter().lat
	}

	async function fetchEvents() {
		try {
			// No days parameter: /api/calendar merges the global calendar with every
			// national chapter calendar, and the full set feeds the Events list below.
			const response = await fetch('/api/calendar')
			if (response.ok) {
				const data = (await response.json()) as CalendarResponse
				return data.entries.map((entry) => entry.event)
			}
			console.error('Failed to fetch events:', response.statusText)
		} catch (error) {
			console.error('Error fetching events:', error)
		}
		return []
	}

	async function fetchUserLocation() {
		try {
			const response = await fetch('/api/geo')
			if (response.ok) {
				const geoData = (await response.json()) as GeoApiResponse
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
		// Optional, call with error handling. Fetched before the map style so the
		// Events list still renders if the style request fails.
		const [{ userLng, userLat }, events] = await Promise.all([fetchUserLocation(), fetchEvents()])
		upcomingEvents = events
		eventsLoaded = true

		// Required, can throw
		const style = (await fetch(STYLE_URL).then((res) => res.json())) as StyleSpecification
		if (!style) return

		const initialState = {
			lng: userLng ?? lng,
			lat: userLat ?? lat,
			zoom: userLat != null && userLng != null ? LOCATED_ZOOM : zoom
		}

		map = new Map({
			container: mapContainer,
			style: {
				...style,
				projection: {
					type: 'globe'
				}
			},
			center: [initialState.lng, initialState.lat],
			zoom: initialState.zoom,
			transformRequest: (url, resourceType) => {
				if (isMapboxURL(url)) return transformMapboxUrl(url, resourceType, MAPBOX_KEY)
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
								: HERO_ORANGE,
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

			const now = new Date()
			const mapWindowEnd = new Date()
			mapWindowEnd.setDate(now.getDate() + MAP_EVENT_WINDOW_DAYS)

			// Sort descending so earlier events' markers are added last and render on top
			events
				.filter((event) => event.geo_latitude != null && event.geo_longitude != null)
				.filter((event) => {
					const startAt = new Date(event.start_at)
					return startAt >= now && startAt <= mapWindowEnd
				})
				.sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime())
				.forEach((event) => {
					new Marker({
						color: 'var(--event-marker)',
						opacityWhenCovered: '0'
					})
						.setLngLat([event.geo_longitude!, event.geo_latitude!])
						.setPopup(
							new Popup({ offset: [0, -15] }).setHTML(
								`<h3><a href="${escape(`https://lu.ma/${event.url}`)}">${escape(event.name)}</a></h3>` +
									`<p>${new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long' }).format(new Date(event.start_at))}</p>`
							)
						)
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
	to you. The map also includes adjacent AI Safety communities in grey, and upcoming events in
	green.
</p>
<div>
	<div class="map-wrap">
		<div class="map" bind:this={mapContainer}></div>
	</div>
</div>
<CommunitiesList {communities} />

<p>
	Can't find a community near you and want to lead the way? Learn how to do it <Link
		href="/national-groups#how-to-set-up-a-pauseai-national-group">here</Link
	>.
</p>

<h2 id="events">Events</h2>

<p>Interested in attending a PauseAI community event? Find one below.</p>

{#if !eventsLoaded}
	<p class="events-status">Loading events...</p>
{:else if upcomingEvents.length === 0}
	<p class="events-status">
		Nothing is listed at the moment. Our <Link href="https://lu.ma/PauseAI">calendar page</Link> has the
		latest.
	</p>
{:else}
	<ul class="events">
		{#each upcomingEvents as event (event.url)}
			<li>
				<time datetime={new Date(event.start_at).toISOString()}>
					{EVENT_DATE_FORMAT.format(new Date(event.start_at))}
				</time>
				<Link href={`https://lu.ma/${event.url}`}>{event.name}</Link>
			</li>
		{/each}
	</ul>
{/if}

<p>
	Find the full list of events <Link href="https://lu.ma/PauseAI">here</Link>.
</p>

<p>
	If you want to organize an event, please create an event on Luma and press the "submit event"
	button on <Link href="https://lu.ma/PauseAI">our calendar page</Link>.
</p>

<style>
	.events {
		list-style: none;
		margin: 0;
		padding: 0;
		border: 1px solid var(--border-luma-embed);
		border-radius: 24px;
		overflow: hidden;
	}

	.events li {
		display: flex;
		gap: 1rem;
		padding: 0.75rem 1.25rem;
	}

	.events li + li {
		border-top: 1px solid var(--border-luma-embed);
	}

	.events time {
		flex: 0 0 10rem;
		color: var(--text-subtle);
		font-variant-numeric: tabular-nums;
	}

	.events-status {
		color: var(--text-subtle);
	}

	@media (max-width: 480px) {
		.events li {
			flex-direction: column;
			gap: 0.25rem;
		}

		.events time {
			flex: none;
		}
	}

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

	/* Maplibre popups stay white for contrast against the dark-mode map; force dark text on it */
	:global(.maplibregl-popup-content) {
		color: var(--grey-500);
		text-align: center;
	}

	:global(.maplibregl-popup-content p) {
		font-family: var(--font-body);
	}
</style>
