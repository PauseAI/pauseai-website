import { writeFileSync } from 'node:fs'
import { getIgnores } from './utils/ignores.js'

const MANUAL_IGNORES = ['pnpm-lock.yaml', 'src/lib/components/widget-consent/loadTwitter.js']

const content = [
	'# This file is dynamically generated from scripts/ignores.js and prettier.config.js',
	'# DO NOT EDIT MANUALLY',
	'',
	...getIgnores(),
	'',
	'# Manual ignores (specific to Prettier)',
	...MANUAL_IGNORES
].join('\n')

writeFileSync('.prettierignore', content)
console.log('✅ .prettierignore generated successfully')
