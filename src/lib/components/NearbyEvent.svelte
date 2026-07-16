<script lang="ts">
	import type { GeoApiResponse } from '$api/geo/+server'
	import Link from '$lib/components/Link.svelte'
	import distance from '@turf/distance'
	import { onMount } from 'svelte'
	import type { CalendarResponse, Event } from '$api/calendar/+server'
	import Banner from '$lib/components/Banner.svelte'

	interface Props {
		contrast: boolean
		eventFound?: boolean
		geo?: GeoApiResponse | null
	}

	let { contrast, eventFound = $bindable(false), geo = null }: Props = $props()

	const FORMAT = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long' })
	const MAX_DISTANCE_KM = 100
	const DISTANCE_OVERRIDES: Record<string, number> = {
		jogj70dj: 480 // Override for specific D.C. (Capitol Hill) event to include users up to 250 miles away
	}

	let events: CalendarResponse | null = $state(null)
	let nearbyEvent: Event | null = $derived(geo && events ? findNearbyEvent(geo, events) : null)

	onMount(async () => {
		events = await fetchLuma()
	})

	function findNearbyEvent(geo: GeoApiResponse, events: CalendarResponse) {
		const { latitude: userLatitude, longitude: userLongitude } = geo
		if (userLatitude == null || userLongitude == null) return null

		const userCoords: [number, number] = [userLongitude, userLatitude]

		const isNearby = (event: Event): boolean => {
			const { geo_latitude, geo_longitude, url } = event
			if (geo_latitude == null || geo_longitude == null) return false
			const eventCoords: [number, number] = [geo_longitude, geo_latitude]

			const maxDistance = DISTANCE_OVERRIDES[url] ?? MAX_DISTANCE_KM

			return distance(userCoords, eventCoords, { units: 'kilometers' }) <= maxDistance
		}

		return events.entries.map((entry) => entry.event).find(isNearby) ?? null
	}

	async function fetchLuma(): Promise<CalendarResponse> {
		const response = await fetch('/api/calendar?days=30')
		return (await response.json()) as CalendarResponse
	}

	$effect(() => {
		eventFound = !!nearbyEvent
	})
</script>

{#if nearbyEvent}
	<Banner {contrast}>
		Next up in your area: <Link
			href={'https://lu.ma/' + nearbyEvent.url + '?utm_source=local-banner'}
			>{nearbyEvent.name}</Link
		> on {FORMAT.format(new Date(nearbyEvent.start_at))}
	</Banner>
{/if}
