import type { Platform } from '$lib/netlify'
import type GetItems from '$lib/clients/luma/types/calendar/get-items'

export function fetchGeo() {
	return fetch('/api/geo').then((res) => res.json()) as Promise<Platform['context']['geo']>
}

export function fetchLuma() {
	return fetch('/api/luma').then((res) => res.json()) as Promise<GetItems>
}
