import { describe, expect, it } from 'vitest'
import { sentryEnvironment } from './env'

describe('sentryEnvironment', () => {
	it.each(['production', 'deploy-preview', 'branch-deploy', 'dev'])(
		'passes the Netlify context %s through',
		(context) => {
			expect(sentryEnvironment(context)).toBe(context)
		}
	)

	it.each([undefined, ''])('falls back to development when CONTEXT is %j', (context) => {
		expect(sentryEnvironment(context)).toBe('development')
	})
})
