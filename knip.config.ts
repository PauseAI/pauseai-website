import { KnipConfig } from 'knip'

const config: KnipConfig = {
	include: ['dependencies'],
	ignoreDependencies: ['@sentry/cli']
}

export default config
