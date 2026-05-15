import type { KnipConfig } from 'knip'
import { getIgnores } from './scripts/utils/ignores.js'

const ADDITIONALLY_ENTRY_POINTS = [
	'src/routes/sayno/SelfieUX.svelte', // dynamically imported
	'src/lib/components/NationalGroupItem.svelte', // imported only in Markdown file
	'src/lib/components/PressCoveragePanelLoader.svelte', // imported only in Markdown file
	'tests/visual/msw-setup.ts' // loaded via NPM_CONFIG_NODE_OPTIONS=--import in the visual-diff workflow
]

const config: KnipConfig = {
	include: ['dependencies', 'exports'],
	ignore: getIgnores(),
	entry: ADDITIONALLY_ENTRY_POINTS
}

export default config
