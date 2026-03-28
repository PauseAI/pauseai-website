import { resolveImageUrl } from '$lib/images'
import { headersToRecord } from '$lib/utils'
import Headers from '@remix-run/headers'
import { StatusCodes } from 'http-status-codes'

export const GET = ({ params }) => {
	if (!params.path) {
		return new Response(null, { status: StatusCodes.NOT_FOUND })
	}

	const headers = new Headers({
		location: resolveImageUrl('/' + params.path)
	})
	return new Response(null, {
		status: StatusCodes.TEMPORARY_REDIRECT,
		headers: headersToRecord(headers)
	})
}
