<script lang="ts">
	import type GetItems from '$lib/clients/luma/types/calendar/get-items'
	import type { Event } from '$lib/clients/luma/types/calendar/get-items'
	import distance from '@turf/distance'
	import { onMount } from 'svelte'
	import type { Platform } from '$lib/netlify'
	import Banner from './Banner.svelte'
	import ExternalLink from '$lib/components/custom/a.svelte'

	const MAX_DISTANCE_KM = 100

	let nearbyEvent: Event | null = null

	onMount(async () => {
		const [geo, events] = await Promise.all([
			fetch('/api/geo').then((res) => res.json()) as Promise<Platform['context']['geo']>,
			fetch('/api/luma').then((res) => res.json()) as Promise<GetItems>
		])

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
</script>

{#if nearbyEvent}
	<Banner>
		Next up in your area: <ExternalLink href={nearbyEvent.url}>{nearbyEvent.name}</ExternalLink> on {nearbyEvent.start_at.toDateString()}
	</Banner>
{/if}
