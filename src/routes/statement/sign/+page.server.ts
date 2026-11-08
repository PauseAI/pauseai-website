// The action behind the form on /statement. It lives on its own route because /statement
// is prerendered (its +page.ts explains why), and SvelteKit refuses to prerender a page
// with actions. Same split as /join posting to /embed/onboarding-form.
//
// Validation and saving are shared with the public endpoint: $lib/server/statement.
import { isOnboardingLive } from '$lib/server/onboarding'
import {
	MAX_BIO_LENGTH,
	MAX_NAME_LENGTH,
	readLimitedBody,
	signStatement,
	takeSigningRateLimit,
	type SignatureErrors,
	type SignatureField,
	type SignatureFieldError
} from '$lib/server/statement'
import { checkNotSpam } from '$lib/server/turnstile-verify'
import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'

export const prerender = false

const FIELD_MESSAGES: Record<SignatureField, Partial<Record<SignatureFieldError, string>>> = {
	name: {
		required: 'Please enter your full name.',
		too_long: `Please keep your name under ${MAX_NAME_LENGTH} characters.`,
		invalid: 'Please enter your name as plain text.'
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
	private: { required: 'Please try again.', invalid: 'Please try again.' }
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
		if (takeSigningRateLimit(getClientAddress) !== null) {
			return fail(429, { message: 'Too many attempts. Please wait a few minutes and try again.' })
		}

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

		// Only when the submission writes, as on the onboarding form: a deploy preview cannot
		// produce a token, since its hostname isn't allowed by the site key.
		if (isOnboardingLive()) {
			const spam = await checkNotSpam(data, url.hostname)
			if (spam.drop) return { success: true }
			if (spam.message) return fail(403, { message: spam.message })
		}

		const result = await signStatement({
			name: data.get('name'),
			email: data.get('email'),
			country: data.get('country'),
			bio: data.get('bio'),
			private: data.get('private') === 'on',
			honeypot: data.get('nickname')
		})

		switch (result.status) {
			case 'accepted':
				return { success: true }
			case 'invalid':
				return fail(400, {
					message: 'Please check the highlighted fields.',
					fields: fieldMessages(result.errors)
				})
			case 'failed':
				return fail(502, { message: 'Sorry, we could not save your signature. Please try again.' })
		}
	}
}
