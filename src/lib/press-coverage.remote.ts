import { prerender } from '$app/server'
import { fetchPressCoverage, type PressCoverage } from './server/notion-press'

export type { PressCoverage }

export const getPressCoverage = prerender(() => fetchPressCoverage())
