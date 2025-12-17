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
		if (!userLatitude || !userLongitude) return null

		const userCoords = [userLatitude, userLongitude]

		const isNearby = (event: Event): boolean => {
			const { geo_latitude, geo_longitude } = event
			if (!geo_latitude || !geo_longitude) return false
			const eventCoords = [geo_latitude, geo_longitude]
			return distance(userCoords, eventCoords, { units: 'kilometers' }) <= MAX_DISTANCE_KM
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
