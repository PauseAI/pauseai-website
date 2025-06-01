import { readEdgeManifest, searchRenderFunction, writeEdgeManifest } from './utils'
import { USE_EDGE_FUNCTIONS } from '../svelte.config.js'

if (!USE_EDGE_FUNCTIONS) {
	console.log('⏭️  Skipping edge caching opt-in - not using edge functions')
	process.exit(0)
}

const manifest = await readEdgeManifest()
const renderFunction = await searchRenderFunction(manifest)
renderFunction.cache = 'manual'
await writeEdgeManifest(manifest)
