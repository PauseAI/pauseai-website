<script lang="ts">
	import type { GeoApiResponse } from '$api/geo/+server'
	import Link from '$lib/components/Link.svelte'
	import distance from '@turf/distance'
	import { onMount } from 'svelte'
	import type { CalendarResponse, Event } from '$api/calendar/+server'
	import Banner from '$lib/components/Banner.svelte'

	export let contrast: boolean
	export let eventFound = false
	export let geo: GeoApiResponse | null = null

	const FORMAT = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long' })
	const MAX_DISTANCE_KM = 100

	let events: CalendarResponse | null = null
	let nearbyEvent: Event | null = null

	$: eventFound = !!nearbyEvent

	onMount(async () => {
		events = await fetchLuma()
	})

	$: if (geo && events) {
		nearbyEvent = findNearbyEvent(geo, events)
	}

	function findNearbyEvent(geo: GeoApiResponse, events: CalendarResponse) {
		const { latitude: userLatitude, longitude: userLongitude } = geo
		if (userLatitude == null || userLongitude == null) return null

		const userCoords: [number, number] = [userLongitude, userLatitude]

		const isNearby = (event: Event): boolean => {
			const { geo_latitude, geo_longitude, url } = event
			if (geo_latitude == null || geo_longitude == null) return false
			const eventCoords: [number, number] = [geo_longitude, geo_latitude]

			// Override for specific D.C. (Capitol Hill) event to include users up to 250 miles away
			const maxDistance = url === 'jogj70dj' ? 402 : MAX_DISTANCE_KM

			return distance(userCoords, eventCoords, { units: 'kilometers' }) <= maxDistance
		}

		return events.entries.map((entry) => entry.event).find(isNearby) ?? null
	}

	async function fetchLuma(): Promise<CalendarResponse> {
		return fetch('/api/calendar').then((res) => res.json())
	}
</script>

{#if nearbyEvent}
	<Banner {contrast}>
		Next up in your area: <Link
			href={'https://lu.ma/' + nearbyEvent.url + '?utm_source=local-banner'}
			>{nearbyEvent.name}</Link
		> on {FORMAT.format(new Date(nearbyEvent.start_at))}
	</Banner>
{/if}
