import { readEdgeConfig, searchRenderFunction, writeEdgeConfig } from './utils/utils'
import { USE_EDGE_FUNCTIONS } from '../svelte.config.js'

if (!USE_EDGE_FUNCTIONS) {
	console.log('⏭️  Skipping edge function exclusion - not using edge functions')
	process.exit(0)
}

const EXCLUDE_PATHS: `/${string}`[] = ['/pagefind/*']

const config = await readEdgeConfig()
const renderFunction = searchRenderFunction(config)!
if (!renderFunction.excludedPath) renderFunction.excludedPath = []
renderFunction.excludedPath = EXCLUDE_PATHS.concat(renderFunction.excludedPath)
await writeEdgeConfig(config)
