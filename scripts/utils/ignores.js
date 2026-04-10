import gitignore from 'eslint-config-flat-gitignore'
import { globbySync } from 'globby'

export function getIgnores() {
	return gitignore({
		files: globbySync('**/.gitignore', { ignore: ['**/node_modules'] })
	}).ignores
}
