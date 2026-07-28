import { readEdgeConfig, searchRenderFunction, writeEdgeConfig } from './utils/utils'
import { USE_EDGE_FUNCTIONS } from '../svelte.config.js'

if (!USE_EDGE_FUNCTIONS) {
	console.log('⏭️  Skipping edge caching opt-in - not using edge functions')
	process.exit(0)
}

const config = await readEdgeConfig()
const renderFunction = searchRenderFunction(config)!
renderFunction.cache = 'manual'
await writeEdgeConfig(config)
