import type { KnipConfig } from 'knip'
import eslintConfigGitignore from 'eslint-config-flat-gitignore'
import { globbySync } from 'globby'

const ADDITIONALLY_ENTRY_POINTS = [
	'src/routes/sayno/SelfieUX.svelte', // dynamically imported
	'src/lib/components/NationalGroupItem.svelte' // imported only in Markdown file
]

const ignored = eslintConfigGitignore({
	files: globbySync('**/.gitignore', { ignore: ['**/node_modules'] })
}).ignores

const config: KnipConfig = {
	include: ['dependencies', 'exports'],
	ignore: ignored,
	ignoreDependencies: ['lint-staged'],
	entry: ADDITIONALLY_ENTRY_POINTS
}

export default config
