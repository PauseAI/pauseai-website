/**
 * Check OpenRouter account status (spend, limit, etc.)
 * Usage: pnpm l10n:status
 */

import dotenv from 'dotenv'
dotenv.config()

const key = process.env.L10N_OPENROUTER_API_KEY
if (!key) {
	console.error('L10N_OPENROUTER_API_KEY not set in .env')
	process.exit(1)
}

const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
	headers: { Authorization: `Bearer ${key}` }
})

if (!res.ok) {
	console.error(`OpenRouter API error: ${res.status} ${res.statusText}`)
	process.exit(1)
}

const data = await res.json()
const usage = data.data?.usage
const limit = data.data?.limit

console.log(`Label:   ${data.data?.label ?? '(none)'}`)
console.log(`Usage:   $${(usage ?? 0).toFixed(2)}`)
console.log(`Limit:   $${limit != null ? limit.toFixed(2) : 'unlimited'}`)
if (limit != null) {
	console.log(`Remaining: $${(limit - (usage ?? 0)).toFixed(2)}`)
}
