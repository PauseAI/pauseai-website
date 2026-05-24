import type { KnipConfig } from 'knip'
import { getIgnores } from './scripts/utils/ignores.js'

const ADDITIONALLY_ENTRY_POINTS = [
	'src/routes/sayno/SelfieUX.svelte', // dynamically imported
	'src/lib/components/NationalGroupItem.svelte', // imported only in Markdown file
	'src/lib/components/PressCoveragePanelLoader.svelte' // imported only in Markdown file
]

const config: KnipConfig = {
	include: ['dependencies', 'exports'],
	ignore: getIgnores(),
	entry: ADDITIONALLY_ENTRY_POINTS
}

export default config
