import * as pagefind from 'pagefind'
import { promises as fs } from 'fs'

const { index, errors } = await pagefind.createIndex({})
if (!index) {
	throw new Error(errors.toString())
}
await index.addDirectory({ path: 'build' })
await index.writeFiles({ outputPath: 'static/pagefind' })

await fs.cp('static/pagefind', 'build/pagefind', { recursive: true })
