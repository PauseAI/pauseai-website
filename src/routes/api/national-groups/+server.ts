import type { NationalGroup } from '$lib/types.js'
import { error, json } from '@sveltejs/kit'
import { getNationalGroups } from '$lib/server/nationalGroups'
import { generateCacheControlRecord } from '$lib/utils'
import type { RequestHandler } from './$types'

export type NationalGroupsApiResponse = NationalGroup[]

export const GET: RequestHandler = async ({ setHeaders }) => {
	const groups = await getNationalGroups()
	if (!groups) error(502, 'Could not read the national groups')
	setHeaders(generateCacheControlRecord({ public: true, maxAge: 60 * 60 }))
	return json(groups satisfies NationalGroupsApiResponse)
}
