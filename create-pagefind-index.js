import { promises as fs } from 'fs'
import * as pagefind from 'pagefind'

const MANIFEST_PATH = '.netlify/edge-functions/manifest.json'
const EXCLUDE_PATHS = ['^/pagefind/.*$']

const { index } = await pagefind.createIndex()
await index.addDirectory({ path: 'build' })
await index.writeFiles({ outputPath: 'static/pagefind' })

await fs.cp('static/pagefind', 'build/pagefind', { recursive: true })

const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf-8'))
const renderFunction = manifest.functions.find(
	(/** @type {{ function: string; }} */ route) => route.function == 'render'
)
if (!renderFunction.excludedPattern) renderFunction.excludedPattern = []
renderFunction.excludedPattern = EXCLUDE_PATHS.concat(renderFunction.excludedPattern)
await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest))
