import type { NationalGroup } from '$lib/types.js'
import { error, json } from '@sveltejs/kit'
import { getNationalGroups, nationalGroupsBackgroundWork } from '$lib/server/nationalGroups'
import { platformWaitUntil } from '$lib/server/onboardingEmail/chapter.js'
import { generateCacheControlRecord } from '$lib/utils'
import type { RequestHandler } from './$types'

export type NationalGroupsApiResponse = NationalGroup[]

export const GET: RequestHandler = async ({ setHeaders, platform }) => {
	const groups = await getNationalGroups()
	// Any work the read started, kept alive past the response.
	platformWaitUntil(platform)?.(nationalGroupsBackgroundWork())
	if (!groups) error(502, 'Could not read the national groups')
	setHeaders(generateCacheControlRecord({ public: true, maxAge: 60 * 60 }))
	return json(groups satisfies NationalGroupsApiResponse)
}
