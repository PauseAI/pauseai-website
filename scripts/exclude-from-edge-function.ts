import { readEdgeManifest, searchRenderFunction, writeEdgeManifest } from './utils'

const EXCLUDE_PATHS = ['^/pagefind/.*$', '^/~partytown/.*$']

const manifest = await readEdgeManifest()
const renderFunction = await searchRenderFunction(manifest)
if (!renderFunction.excludedPattern) renderFunction.excludedPattern = []
renderFunction.excludedPattern = EXCLUDE_PATHS.concat(renderFunction.excludedPattern)
await writeEdgeManifest(manifest)
