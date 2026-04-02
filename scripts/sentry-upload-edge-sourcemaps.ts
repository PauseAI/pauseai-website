/**
 * Upload Netlify edge function source maps to Sentry.
 *
 * The Sentry Vite plugin uploads source maps during `writeBundle`, but adapter-netlify
 * creates edge function bundles later during `closeBundle`. This script runs as a postbuild
 * step to upload those edge source maps that the Vite plugin misses.
 */
import { execSync } from 'child_process'
import { existsSync } from 'fs'

const hasToken = !!process.env.SENTRY_AUTH_TOKEN
const hasOrg = !!process.env.SENTRY_ORG
const hasProject = !!process.env.SENTRY_PROJECT
const edgeFunctionsDir = '.netlify/edge-functions'

if (!hasToken || !hasOrg || !hasProject) {
	console.log('⏭️  Skipping Sentry edge sourcemap upload — missing SENTRY_AUTH_TOKEN/ORG/PROJECT')
	process.exit(0)
}

if (!existsSync(edgeFunctionsDir)) {
	console.log('⏭️  Skipping Sentry edge sourcemap upload — no edge functions directory')
	process.exit(0)
}

let release: string
try {
	release = process.env.COMMIT_REF || execSync('git rev-parse HEAD').toString().trim()
} catch {
	console.error('⚠️  Failed to determine release — skipping edge sourcemap upload')
	process.exit(0)
}

console.log('📤 Injecting Debug IDs and uploading edge function source maps to Sentry...')
try {
	execSync(`npx @sentry/cli sourcemaps inject ${edgeFunctionsDir}`, { stdio: 'inherit' })
	execSync(
		`npx @sentry/cli sourcemaps upload --org ${process.env.SENTRY_ORG} --project ${process.env.SENTRY_PROJECT} --release ${release} ${edgeFunctionsDir}`,
		{ stdio: 'inherit' }
	)
	console.log('✅ Edge function source maps uploaded')
} catch (e) {
	console.error('⚠️  Failed to upload edge source maps (non-fatal):', e)
}
