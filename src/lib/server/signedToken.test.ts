import { describe, expect, it } from 'vitest'
import { checkToken, signToken } from './signedToken.js'

const SECRET = 'test-secret'
const PREFIX = 'purpose:v1:rec1'
const NOW = 1_800_000_000_000
const EXPIRY = NOW / 1000 + 3600

const check = (token: string, now = NOW, prefix = PREFIX, secret = SECRET) =>
	checkToken(secret, prefix, token, now)

describe('signToken and checkToken', () => {
	it('signs `<prefix>:<expiry>` and accepts it until the expiry', async () => {
		const token = await signToken(SECRET, PREFIX, EXPIRY)
		expect(token).toMatch(new RegExp(`^v1\\.${EXPIRY}\\.[A-Za-z0-9_-]{43}$`))
		expect(await check(token)).toBe('valid')
		expect(await check(token, EXPIRY * 1000 - 1)).toBe('valid')
		expect(await check(token, EXPIRY * 1000)).toBe('expired')
	})

	it('rejects another prefix or secret', async () => {
		const token = await signToken(SECRET, PREFIX, EXPIRY)
		expect(await check(token, NOW, 'purpose:v1:rec2')).toBe('invalid')
		expect(await check(token, NOW, PREFIX, 'other-secret')).toBe('invalid')
	})

	it('rejects a tampered signature or expiry', async () => {
		const [version, expiry, signature] = (await signToken(SECRET, PREFIX, EXPIRY)).split('.')
		// The first character: the last one carries padding bits atob ignores.
		const flipped = (signature[0] === 'A' ? 'B' : 'A') + signature.slice(1)
		expect(await check(`${version}.${expiry}.${flipped}`)).toBe('invalid')
		expect(await check(`${version}.${Number(expiry) + 86400}.${signature}`)).toBe('invalid')
	})

	it('reports a missing token, and malformed ones without throwing', async () => {
		const token = await signToken(SECRET, PREFIX, EXPIRY)
		const [, expiry, signature] = token.split('.')
		expect(await check('')).toBe('missing')
		for (const bad of [
			'garbage',
			'v1.',
			token.replace(/^v1/, 'v2'),
			`v1.${expiry}`,
			`v1.abc.${signature}`,
			`v1.${expiry}.${signature.slice(1)}`,
			`v1.${expiry}.${signature.slice(0, -1)}!`,
			`${token}.extra`
		]) {
			expect(await check(bad)).toBe('malformed')
		}
	})
})
