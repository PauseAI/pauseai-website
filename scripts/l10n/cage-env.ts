/**
 * Helpers for determining how the l10n cage is sourced.
 * The Spanish fork vendors the cage inside the repo, so we detect that case
 * to relax Git branch restrictions without requiring extra env vars.
 */

import path from 'path'
import { spawnSync } from 'child_process'
import { L10N_CAGE_DIR } from '../../src/lib/l10n'

// Cache detection so we only ask Git once per process
let cachedDetection: boolean | undefined
let overrideDetection: boolean | undefined

const SENTINEL = path.join(L10N_CAGE_DIR, 'README.md')

function detectBundledCage(): boolean {
	const result = spawnSync('git', ['ls-files', '--error-unmatch', SENTINEL], {
		stdio: 'ignore'
	})
	return result.status === 0 && !result.error
}

/**
 * Returns true when the l10n cage directory is tracked by the website repo.
 * That indicates the cage is bundled locally and branch safety can be relaxed.
 */
export function isBundledCageRepo(): boolean {
	if (overrideDetection !== undefined) {
		return overrideDetection
	}

	if (cachedDetection === undefined) {
		cachedDetection = detectBundledCage()
	}

	return cachedDetection
}

/**
 * Testing helper to force a bundled/non-bundled answer.
 */
export function setBundledCageOverride(value: boolean | undefined): void {
	overrideDetection = value
	cachedDetection = undefined
}
