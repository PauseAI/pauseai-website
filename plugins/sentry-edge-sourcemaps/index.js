import { execSync } from 'child_process'
import { existsSync } from 'fs'

/**
 * Netlify build plugin to upload edge function source maps to Sentry.
 *
 * Runs in onPostBuild, which executes after Netlify's edge function bundling.
 * This ensures we upload the final bundled source maps, not the pre-bundle ones.
 */
export const onPostBuild = ({ constants }) => {
	const { SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT, COMMIT_REF } = process.env

	if (!SENTRY_AUTH_TOKEN || !SENTRY_ORG || !SENTRY_PROJECT) {
		console.log('⏭️  Skipping Sentry edge sourcemap upload — missing SENTRY_AUTH_TOKEN/ORG/PROJECT')
		return
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const edgeDir = constants.EDGE_FUNCTIONS_DIST
	if (!edgeDir || !existsSync(edgeDir)) {
		console.log('⏭️  Skipping Sentry edge sourcemap upload — no edge functions directory')
		return
	}

	let release
	try {
		release = COMMIT_REF || execSync('git rev-parse HEAD').toString().trim()
	} catch {
		console.error('⚠️  Failed to determine release — skipping edge sourcemap upload')
		return
	}

	// Log directory contents for debugging
	try {
		const files = execSync(`find ${edgeDir} -type f`).toString().trim()
		console.log(`📂 Edge functions dist contents:\n${files}`)
	} catch {
		console.log('📂 Could not list edge functions dist contents')
	}

	console.log(`📤 Injecting Debug IDs and uploading edge function source maps to Sentry...`)
	try {
		execSync(`npx @sentry/cli sourcemaps inject ${edgeDir}`, { stdio: 'inherit' })
		execSync(
			`npx @sentry/cli sourcemaps upload --org ${SENTRY_ORG} --project ${SENTRY_PROJECT} --release ${release} ${edgeDir}`,
			{ stdio: 'inherit' }
		)
		console.log('✅ Edge function source maps uploaded')
	} catch (e) {
		console.error('⚠️  Failed to upload edge source maps (non-fatal):', e)
	}
}
