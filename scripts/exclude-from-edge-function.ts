import { readEdgeManifest, searchRenderFunction, writeEdgeManifest } from './utils'
import { USE_EDGE_FUNCTIONS } from '../svelte.config.js'

if (!USE_EDGE_FUNCTIONS) {
	console.log('⏭️  Skipping edge function exclusion - not using edge functions')
	process.exit(0)
}

const EXCLUDE_PATHS = ['/pagefind/*']

const manifest = await readEdgeManifest()
const renderFunction = await searchRenderFunction(manifest)
if (!renderFunction.excludedPath) renderFunction.excludedPath = []
renderFunction.excludedPath = EXCLUDE_PATHS.concat(renderFunction.excludedPath)
await writeEdgeManifest(manifest)
