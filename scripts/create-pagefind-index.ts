import { promises as fs } from 'fs'
import * as pagefind from 'pagefind'
import type { Post } from '../src/lib/types'

const POSTS_PATH = 'build/api/posts'
const INPUT_PATH = 'build'
const STATIC_PATH = 'static/pagefind'
const BUILD_PATH = 'build/pagefind'

const { index, errors } = await pagefind.createIndex({})
if (!index) throw new Error(errors.toString())

const posts: Post[] = JSON.parse(await fs.readFile(POSTS_PATH, 'utf-8'))
for (const post of posts) {
	await index.addCustomRecord({
		url: '/' + post.slug,
		content: post.description ?? '',
		language: 'en',
		meta: {
			title: post.title
		}
	})
}

await index.addDirectory({ path: INPUT_PATH })

await index.writeFiles({ outputPath: STATIC_PATH })

await pagefind.close()

await fs.cp(STATIC_PATH, BUILD_PATH, { recursive: true })
