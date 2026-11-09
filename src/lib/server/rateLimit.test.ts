import { beforeEach, describe, expect, it } from 'vitest'
import {
	peekRateLimit,
	rateLimitKeyForAddress,
	recordRateLimit,
	resetRateLimits,
	takeRateLimit
} from './rateLimit'

beforeEach(() => resetRateLimits())

describe('rateLimitKeyForAddress', () => {
	it('counts addresses in one IPv6 /64 together', () => {
		const key = rateLimitKeyForAddress('2001:db8:1:2:aaaa::1')

		expect(key).toBe('2001:db8:1:2::/64')
		expect(rateLimitKeyForAddress('2001:db8:1:2:bbbb:cccc:dddd:eeee')).toBe(key)
		expect(rateLimitKeyForAddress('2001:DB8:1:2::9')).toBe(key)
		expect(rateLimitKeyForAddress('2001:0db8:0001:0002::9')).toBe(key)
		expect(rateLimitKeyForAddress('2001:db8:1:2::9%eth0')).toBe(key)
	})

	it('keeps different /64s apart', () => {
		expect(rateLimitKeyForAddress('2001:db8:1:3::1')).not.toBe(
			rateLimitKeyForAddress('2001:db8:1:2::1')
		)
	})

	it('expands a :: in the first four groups', () => {
		expect(rateLimitKeyForAddress('2001::1')).toBe('2001:0:0:0::/64')
		expect(rateLimitKeyForAddress('::1')).toBe('0:0:0:0::/64')
	})

	it('counts an IPv4-mapped address as its IPv4 address', () => {
		expect(rateLimitKeyForAddress('::ffff:192.0.2.1')).toBe('192.0.2.1')
		expect(rateLimitKeyForAddress('::ffff:c000:201')).toBe('192.0.2.1')
	})

	it('leaves IPv4 and anything unparseable as it is', () => {
		expect(rateLimitKeyForAddress('192.0.2.1')).toBe('192.0.2.1')
		expect(rateLimitKeyForAddress('not:an:address')).toBe('not:an:address')
		expect(rateLimitKeyForAddress('1::2::3')).toBe('1::2::3')
		expect(rateLimitKeyForAddress('::ffff:999.0.2.1')).toBe('::ffff:999.0.2.1')
	})
})

describe('peekRateLimit and recordRateLimit', () => {
	it('allows up to the limit, counting only what is recorded', () => {
		for (let check = 0; check < 5; check++) expect(peekRateLimit('key', 2, 1000)).toBeNull()

		recordRateLimit('key', 10_000, 1000)
		expect(peekRateLimit('key', 2, 1000)).toBeNull()
		recordRateLimit('key', 10_000, 1000)
		expect(peekRateLimit('key', 2, 1000)).toBe(10)
	})

	it('forgets a window once it has passed', () => {
		recordRateLimit('key', 10_000, 1000)
		expect(peekRateLimit('key', 1, 2000)).toBe(9)
		expect(peekRateLimit('key', 1, 11_000)).toBeNull()

		recordRateLimit('key', 10_000, 11_000)
		expect(peekRateLimit('key', 2, 11_000)).toBeNull()
	})

	it('takeRateLimit shares the same counters', () => {
		recordRateLimit('key', 10_000, 1000)
		expect(takeRateLimit('key', 1, 10_000, 1000)).toBe(10)
	})
})
