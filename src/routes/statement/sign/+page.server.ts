// The action behind the form on /statement. It lives on its own route because /statement
// is prerendered (its +page.ts explains why), and SvelteKit refuses to prerender a page
// with actions. Same split as /join posting to /embed/onboarding-form.
//
// Validation and saving are shared with the public endpoint: $lib/server/statement.
import {
	MAX_BIO_LENGTH,
	MAX_NAME_LENGTH,
	readLimitedBody,
	signStatement,
	type SignatureErrors,
	type SignatureField,
	type SignatureFieldError
} from '$lib/server/statement'
import { TURNSTILE_FIELD } from '$lib/turnstile'
import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'

export const prerender = false

const FIELD_MESSAGES: Record<SignatureField, Partial<Record<SignatureFieldError, string>>> = {
	name: {
		required: 'Please enter your full name.',
		too_long: `Please keep your name under ${MAX_NAME_LENGTH} characters.`,
		invalid: 'Please enter your name as plain text, without any links.'
	},
	email: {
		required: 'Please enter your email address.',
		too_long: 'Please enter a valid email address.',
		invalid: 'Please enter a valid email address.'
	},
	country: {
		required: 'Please select your country of residence.',
		invalid: 'Please select a country from the list.'
	},
	bio: {
		too_long: `Please keep this under ${MAX_BIO_LENGTH} characters.`,
		invalid: 'Please enter this as plain text.'
	},
	private: { required: 'Please try again.', invalid: 'Please try again.' },
	// The form doesn't send one, so only a hand-made post can get this.
	language: { invalid: 'Please try again.' }
}

const fieldMessages = (errors: SignatureErrors) =>
	Object.fromEntries(
		Object.entries(errors).map(([field, error]) => [
			field,
			FIELD_MESSAGES[field as SignatureField][error]
		])
	)

export const actions: Actions = {
	default: async ({ request, url, getClientAddress }) => {
		// None of these failures echo what was posted. The form keeps its own state and never
		// resets on a failure, so the person's input stays on screen.
		const bytes = await readLimitedBody(request)
		if (!bytes) return fail(413, { message: 'That was too long to send. Please shorten it.' })
		let data: FormData
		try {
			const contentType = request.headers.get('content-type') ?? ''
			data = await new Response(new Blob([bytes as BlobPart]), {
				headers: { 'content-type': contentType }
			}).formData()
		} catch {
			return fail(400, { message: 'Something went wrong. Please try again.' })
		}

		const result = await signStatement(
			{
				name: data.get('name'),
				email: data.get('email'),
				country: data.get('country'),
				bio: data.get('bio'),
				private: data.get('private') === 'on',
				honeypot: data.get('nickname')
			},
			{
				hostname: url.hostname,
				allowedHostnames: [url.hostname],
				turnstileToken: data.get(TURNSTILE_FIELD),
				getClientAddress
			}
		)

		switch (result.status) {
			case 'accepted':
			case 'dry_run':
				return { success: true }
			case 'invalid':
				return fail(400, {
					message: 'Please check the highlighted fields.',
					fields: fieldMessages(result.errors)
				})
			case 'unavailable':
				return fail(503, {
					message:
						'Signing is unavailable right now, and nothing was saved. Please try again later, or email contact@pauseai.info.'
				})
			case 'turnstile_failed':
				return fail(403, { message: result.message })
			case 'turnstile_unavailable':
				return fail(503, { message: result.message })
			case 'rate_limited':
				return fail(429, { message: 'Too many attempts. Please wait a few minutes and try again.' })
			case 'failed':
				return fail(502, { message: 'Sorry, we could not save your signature. Please try again.' })
		}
	}
}
