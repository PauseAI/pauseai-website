import fs from 'fs'
import path from 'path'
import { json } from '@sveltejs/kit'
import type { Post } from '$lib/types'
import { outcomesMeta } from '../../outcomes/meta'
import { communitiesMeta } from '../../communities/communities'
import { meta as pdoomMeta } from '../../pdoom/meta'
import { meta as quotesMeta } from '../../quotes/meta'
import { meta as emailBuilderMeta } from '../../email-builder/meta'
import { meta as teamsMeta } from '../../teams/meta'
import { meta as statementMeta } from '../../statement/meta'
import { meta as dearSirDemisMeta } from '../../dear-sir-demis-2025/meta'

type InlangSettings = {
	baseLocale?: string
}

const SETTINGS_PATH = path.join(process.cwd(), 'project.inlang/settings.json')
const L10N_ROOT = path.join(process.cwd(), 'l10n-cage/md')

function resolveBaseLocale(): string | null {
	try {
		const settings: InlangSettings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'))
		return settings.baseLocale ?? null
	} catch (error) {
		console.warn(
			'Warning: could not read project.inlang/settings.json. Falling back to English posts.',
			error
		)
		return null
	}
}

const baseLocale = resolveBaseLocale()
const shouldRequireLocalizedMarkdown = baseLocale !== null && baseLocale !== 'en'

function hasLocalizedMarkdown(slug: string): boolean {
	if (!shouldRequireLocalizedMarkdown || baseLocale === null) {
		return true
	}

	const localizedPath = path.join(L10N_ROOT, baseLocale, `${slug}.md`)
	return fs.existsSync(localizedPath)
}

/** When adding an extra route, make sure to add the metadata here for SEO purposes */
const hardCodedPages: Post[] = [
	outcomesMeta,
	communitiesMeta,
	pdoomMeta,
	quotesMeta,
	emailBuilderMeta,
	teamsMeta,
	statementMeta,
	dearSirDemisMeta
]

async function getPosts() {
	let posts: Post[] = []

	const paths = import.meta.glob('/src/posts/*.md', { eager: true })

	for (const path in paths) {
		const file = paths[path]
		const slug = path.split('/').at(-1)?.replace('.md', '')

		if (
			file &&
			typeof file === 'object' &&
			'metadata' in file &&
			slug &&
			!slug.startsWith('debug.')
		) {
			if (!hasLocalizedMarkdown(slug)) {
				continue
			}
			const metadata = file.metadata as Omit<Post, 'slug'>
			const post = { ...metadata, slug } satisfies Post
			posts.push(post)
		}
	}

	posts.push(...hardCodedPages)

	posts = posts.sort(
		(first, second) =>
			(second.date ? new Date(second.date).getTime() : 0) -
			(first.date ? new Date(first.date).getTime() : 0)
	)

	return posts
}

export async function GET() {
	const posts = await getPosts()
	return json(posts)
}
