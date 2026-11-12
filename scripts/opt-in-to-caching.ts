import { readEdgeManifest, searchRenderFunction, writeEdgeManifest } from './utils/utils';

// @migration-task svelte.config was removed; switch to `import { loadConfig } from '@sveltejs/load-config'` to read your config
import { USE_EDGE_FUNCTIONS } from '../svelte.config.js';

if (!USE_EDGE_FUNCTIONS) {
	console.log('⏭️  Skipping edge caching opt-in - not using edge functions')
	process.exit(0)
}

const manifest = await readEdgeManifest()
const renderFunction = searchRenderFunction(manifest)!
renderFunction.cache = 'manual'
await writeEdgeManifest(manifest)
