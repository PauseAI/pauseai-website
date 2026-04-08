/**
 * Work plan management for l10n operations.
 * Separates planning (what needs translating) from execution (spending money).
 *
 * The plan lives at l10n-cage/work/todo.json as committed, usually-empty state.
 * Completion records accumulate as timestamped files in l10n-cage/work/.
 */

import fs from 'fs'
import path from 'path'
import { L10N_CAGE_DIR } from '../../src/lib/l10n'

// --- Types ---

export interface WorkItem {
	/** Relative path to source file (from project root, forward slashes) */
	source: string
	/** Target locale code */
	locale: string
	/** Why this item needs work */
	reason: 'new' | 'outdated' | 'forced'
	/** Estimated cost in USD */
	estimatedCost: number
	/** Word count of source content */
	contentWords: number
}

export interface WorkPlan {
	version: number
	created: string
	branch: string
	model: string
	items: WorkItem[]
}

// --- Constants ---

const PLAN_VERSION = 1
const WORK_DIR = path.join(L10N_CAGE_DIR, 'work')
function todoPath(locales: string[]): string {
	const suffix = locales.slice().sort().join(',')
	return path.join(WORK_DIR, `todo-${suffix}.json`)
}

const DEFAULT_SPEND_LOCAL = 0.1
const DEFAULT_SPEND_CI = 0.5

// --- File I/O ---

function ensureWorkDir(): void {
	if (!fs.existsSync(WORK_DIR)) {
		fs.mkdirSync(WORK_DIR, { recursive: true })
	}
}

/** Read the current todo. Returns null if file is missing or has no items. */
export function readTodo(locales: string[]): WorkPlan | null {
	const p = todoPath(locales)
	if (!fs.existsSync(p)) return null
	try {
		const plan = JSON.parse(fs.readFileSync(p, 'utf-8')) as WorkPlan
		if (!plan.items || plan.items.length === 0) return null
		return plan
	} catch {
		return null
	}
}

/** Write a plan to the locale-specific todo file. */
export function writeTodo(plan: WorkPlan, locales: string[]): void {
	ensureWorkDir()
	fs.writeFileSync(todoPath(locales), JSON.stringify(plan, null, '\t') + '\n')
}

/** Write an empty plan (the normal resting state). */
export function emptyTodo(locales: string[], branch: string, model: string): void {
	writeTodo(
		{
			version: PLAN_VERSION,
			created: new Date().toISOString(),
			branch,
			model,
			items: []
		},
		locales
	)
}

/**
 * Record completed work as a timestamped file.
 * Does not touch todo.json — caller is responsible for updating it.
 */
export function recordCompletion(completedItems: WorkItem[], plan: WorkPlan): void {
	ensureWorkDir()
	const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)
	const recordPath = path.join(WORK_DIR, `${timestamp}.json`)
	const record: WorkPlan = {
		...plan,
		created: new Date().toISOString(),
		items: completedItems
	}
	fs.writeFileSync(recordPath, JSON.stringify(record, null, '\t') + '\n')
}

// --- Plan creation ---

/** Create a new WorkPlan shell (caller populates items). */
export function createPlan(branch: string, model: string): WorkPlan {
	return {
		version: PLAN_VERSION,
		created: new Date().toISOString(),
		branch,
		model,
		items: []
	}
}

// --- Spend limit ---

export function getSpendLimit(spendArg: number | undefined, isCI: boolean): number {
	if (spendArg !== undefined) return spendArg
	return isCI ? DEFAULT_SPEND_CI : DEFAULT_SPEND_LOCAL
}

function totalEstimatedCost(items: WorkItem[]): number {
	return items.reduce((sum, item) => sum + item.estimatedCost, 0)
}

/**
 * Check whether the plan's cost is within the spend limit.
 * Returns null if OK, or a message string if over limit.
 */
export function checkSpendLimit(plan: WorkPlan, limit: number, locales: string[]): string | null {
	const cost = totalEstimatedCost(plan.items)
	if (cost <= limit) return null
	return (
		`Estimated cost $${cost.toFixed(2)} exceeds spend limit $${limit.toFixed(2)}\n` +
		`Use --spend ${Math.ceil(cost * 10) / 10} to authorize, or review the plan in:\n` +
		`  ${todoPath(locales)}`
	)
}

// --- Reporting ---

export function printPlanSummary(plan: WorkPlan, verbose: boolean): void {
	const cost = totalEstimatedCost(plan.items)
	const byLocale = new Map<string, WorkItem[]>()
	for (const item of plan.items) {
		const list = byLocale.get(item.locale) || []
		list.push(item)
		byLocale.set(item.locale, list)
	}

	console.log(`\nWork plan: ${plan.items.length} items, estimated $${cost.toFixed(2)}`)
	console.log(`Model: ${plan.model}`)
	console.log(`Branch: ${plan.branch}`)

	for (const [locale, items] of byLocale) {
		const localeCost = items.reduce((s, i) => s + i.estimatedCost, 0)
		console.log(`  ${locale}: ${items.length} files, $${localeCost.toFixed(2)}`)
		if (verbose) {
			for (const item of items) {
				console.log(
					`    - ${path.basename(item.source)} (${item.reason}, ${item.contentWords} words)`
				)
			}
		}
	}
	console.log()
}
