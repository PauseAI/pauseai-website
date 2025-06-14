<script lang="ts">
	import distance from '@turf/distance'
	import { onMount } from 'svelte'
	import type { Platform } from '$lib/netlify'
	import Banner from './Banner.svelte'
	import ExternalLink from '$lib/components/custom/a.svelte'
	import type { CalendarResponse, Event } from '../../routes/api/calendar/+server'

	export let contrast: boolean
	export let eventFound = false

	const FORMAT = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long' })
	const MAX_DISTANCE_KM = 100

	let nearbyEvent: Event | null = null

	$: eventFound = !!nearbyEvent

	onMount(async () => {
		const [geo, events] = await Promise.all([fetchGeo(), fetchLuma()])

		const { latitude: userLatitude, longitude: userLongitude } = geo
		if (!userLatitude || !userLongitude) return

		const userCoords = [userLatitude, userLongitude]

		const isNearby = (event: Event): boolean => {
			const { geo_latitude, geo_longitude } = event
			if (!geo_latitude || !geo_longitude) return false
			const eventCoords = [geo_latitude, geo_longitude].map(Number.parseFloat)
			return distance(userCoords, eventCoords, { units: 'kilometers' }) <= MAX_DISTANCE_KM
		}

		nearbyEvent = events.entries.map((entry) => entry.event).find(isNearby) ?? null
	})

	function fetchGeo() {
		return fetch('/api/geo').then((res) => res.json()) as Promise<Platform['context']['geo']>
	}

	function fetchLuma() {
		return fetch('/api/calendar').then((res) => res.json()) as Promise<CalendarResponse>
	}
</script>

{#if nearbyEvent}
	<Banner {contrast}>
		Next up in your area: <ExternalLink
			href={'https://lu.ma/' + nearbyEvent.url + '?utm_source=local-banner'}
			>{nearbyEvent.name}</ExternalLink
		> on {FORMAT.format(new Date(nearbyEvent.start_at))}
	</Banner>
{/if}
