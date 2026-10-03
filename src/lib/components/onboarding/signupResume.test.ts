import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SIGNUP_MAX_AGE_MS } from './signupMaxAge.js'
import {
	afterRecordGone,
	forgetSignup,
	loadSignup,
	sameEmail,
	saveSignup,
	saveSignupFromPost
} from './signupResume.js'

function memoryStorage(): Storage {
	const items = new Map<string, string>()
	return {
		get length() {
			return items.size
		},
		clear: () => items.clear(),
		getItem: (key) => items.get(key) ?? null,
		key: (index) => [...items.keys()][index] ?? null,
		removeItem: (key) => void items.delete(key),
		setItem: (key, value) => void items.set(key, value)
	}
}

describe('signupResume', () => {
	beforeEach(() => vi.stubGlobal('sessionStorage', memoryStorage()))
	afterEach(() => vi.unstubAllGlobals())

	it('returns the saved row for the same address, ignoring case and spaces', () => {
		saveSignup(
			'Ada@Example.org',
			{ recordId: 'rec1', recordToken: 'tok1', keepInformed: true, intent: 'Act now' },
			0
		)
		expect(loadSignup(' ada@example.org ', 1000)).toEqual({
			recordId: 'rec1',
			recordToken: 'tok1',
			keepInformed: true,
			intent: 'Act now'
		})
	})

	it('keeps the row from another address', () => {
		saveSignup(
			'ada@example.org',
			{ recordId: 'rec1', recordToken: 'tok1', keepInformed: true, intent: 'Act now' },
			0
		)
		expect(loadSignup('grace@example.org', 1000)).toBeNull()
		expect(loadSignup('', 1000)).toBeNull()
	})

	it('expires after a day', () => {
		saveSignup(
			'ada@example.org',
			{ recordId: 'rec1', recordToken: 'tok1', keepInformed: false, intent: 'None' },
			0
		)
		expect(loadSignup('ada@example.org', SIGNUP_MAX_AGE_MS)).not.toBeNull()
		expect(loadSignup('ada@example.org', SIGNUP_MAX_AGE_MS + 1)).toBeNull()
	})

	it('keeps only the latest save, until forgotten', () => {
		saveSignup(
			'ada@example.org',
			{ recordId: 'rec1', recordToken: 'tok1', keepInformed: false, intent: 'None' },
			0
		)
		saveSignup(
			'ada@example.org',
			{ recordId: 'rec2', recordToken: 'tok2', keepInformed: true, intent: 'Act now' },
			0
		)
		expect(loadSignup('ada@example.org', 0)).toMatchObject({
			recordId: 'rec2',
			recordToken: 'tok2'
		})
		forgetSignup()
		expect(loadSignup('ada@example.org', 0)).toBeNull()
	})

	it('defaults the intent of an entry saved without one to None', () => {
		sessionStorage.setItem(
			'pauseai-onboarding-signup',
			JSON.stringify({ recordId: 'rec1', email: 'ada@example.org', keepInformed: true, savedAt: 0 })
		)
		expect(loadSignup('ada@example.org', 0)?.intent).toBe('None')
	})

	it('loads an entry saved before tokens existed with no token', () => {
		sessionStorage.setItem(
			'pauseai-onboarding-signup',
			JSON.stringify({ recordId: 'rec1', email: 'ada@example.org', keepInformed: true, savedAt: 0 })
		)
		expect(loadSignup('ada@example.org', 0)?.recordToken).toBe('')
	})

	it('sends a 410 back to wherever consent is collected again', () => {
		expect(afterRecordGone('browse', false)).toBe('retry')
		expect(afterRecordGone('contact', false)).toBe('step-1')
		// The /subscribe continuation hides the consent, so its retry could only 400.
		expect(afterRecordGone('contact', true)).toBe('signup-form')
	})

	it('compares addresses ignoring case and spaces', () => {
		expect(sameEmail(' Ada@Example.org', 'ada@example.org ')).toBe(true)
		expect(sameEmail('ada@example.org', 'grace@example.org')).toBe(false)
	})

	it('saves what a post wrote, with an unknown intent as None', () => {
		const formData = new FormData()
		formData.set('email', 'Ada@example.org')
		formData.set('keep_informed', 'on')
		formData.set('intent', 'Lead')
		saveSignupFromPost(formData, 'rec1', 'tok1')
		expect(loadSignup('ada@example.org')).toEqual({
			recordId: 'rec1',
			recordToken: 'tok1',
			keepInformed: true,
			intent: 'Lead'
		})
		formData.set('intent', 'Overlord')
		formData.delete('keep_informed')
		saveSignupFromPost(formData, 'rec1', 'tok1')
		expect(loadSignup('ada@example.org')).toEqual({
			recordId: 'rec1',
			recordToken: 'tok1',
			keepInformed: false,
			intent: 'None'
		})
	})

	it('treats unreadable or malformed storage as nothing saved', () => {
		sessionStorage.setItem('pauseai-onboarding-signup', '{not json')
		expect(loadSignup('ada@example.org', 0)).toBeNull()
		vi.stubGlobal('sessionStorage', {
			getItem: () => {
				throw new Error('blocked')
			},
			setItem: () => {
				throw new Error('blocked')
			}
		})
		expect(() =>
			saveSignup('ada@example.org', {
				recordId: 'rec1',
				recordToken: 'tok1',
				keepInformed: true,
				intent: 'Act now'
			})
		).not.toThrow()
		expect(loadSignup('ada@example.org')).toBeNull()
	})
})
