import gitignore from 'eslint-config-flat-gitignore'
import { globbySync } from 'globby'

function getIgnores() {
	return gitignore({
		files: globbySync('**/.gitignore', { ignore: ['**/node_modules'] })
	}).ignores
}

export function getPositiveIgnores() {
	return getIgnores().filter((p) => !p.startsWith('!'))
}

export function getNegativeIgnores() {
	return getIgnores()
		.filter((p) => p.startsWith('!'))
		.map((p) => p.slice(1))
}

export function getAllIgnores() {
	return getIgnores()
}
