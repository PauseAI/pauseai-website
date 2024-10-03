import { promises as fs } from 'fs'

const MANIFEST_PATH = '.netlify/edge-functions/manifest.json'
const EXCLUDE_PATHS = ['^/pagefind/.*$']

const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf-8'))
const renderFunction = manifest.functions.find(
	(route: { function: string }) => route.function == 'render'
)
if (!renderFunction.excludedPattern) renderFunction.excludedPattern = []
renderFunction.excludedPattern = EXCLUDE_PATHS.concat(renderFunction.excludedPattern)
await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest))
