import { readEdgeManifest, searchRenderFunction, writeEdgeManifest } from './utils'

const EXCLUDE_PATHS = ['/pagefind/*']

const manifest = await readEdgeManifest()
const renderFunction = await searchRenderFunction(manifest)
if (!renderFunction.excludedPath) renderFunction.excludedPath = []
renderFunction.excludedPath = EXCLUDE_PATHS.concat(renderFunction.excludedPath)
await writeEdgeManifest(manifest)
