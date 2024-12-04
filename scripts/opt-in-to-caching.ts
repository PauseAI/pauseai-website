import { readEdgeManifest, searchRenderFunction, writeEdgeManifest } from './utils'

const manifest = await readEdgeManifest()
const renderFunction = await searchRenderFunction(manifest)
renderFunction.cache = 'manual'
await writeEdgeManifest(manifest)
