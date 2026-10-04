import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SIGNUP_MAX_AGE_MS } from './signupMaxAge.js'
import {
	afterRecordGone,
	chapterAnswerFor,
	heldChapterAnswer,
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
			{
				recordId: 'rec1',
				recordToken: 'tok1',
				keepInformed: true,
				intent: 'Act now',
				chapterAnswer: { answer: 'yes', country: 'Germany' }
			},
			0
		)
		expect(loadSignup(' ada@example.org ', 1000)).toEqual({
			recordId: 'rec1',
			recordToken: 'tok1',
			keepInformed: true,
			intent: 'Act now',
			chapterAnswer: { answer: 'yes', country: 'Germany' }
		})
	})

	it('keeps the row from another address', () => {
		saveSignup(
			'ada@example.org',
			{
				recordId: 'rec1',
				recordToken: 'tok1',
				keepInformed: true,
				intent: 'Act now',
				chapterAnswer: { answer: 'yes', country: 'Germany' }
			},
			0
		)
		expect(loadSignup('grace@example.org', 1000)).toBeNull()
		expect(loadSignup('', 1000)).toBeNull()
	})

	it('expires after a day', () => {
		saveSignup(
			'ada@example.org',
			{
				recordId: 'rec1',
				recordToken: 'tok1',
				keepInformed: false,
				intent: 'None',
				chapterAnswer: null
			},
			0
		)
		expect(loadSignup('ada@example.org', SIGNUP_MAX_AGE_MS)).not.toBeNull()
		expect(loadSignup('ada@example.org', SIGNUP_MAX_AGE_MS + 1)).toBeNull()
	})

	it('keeps only the latest save, until forgotten', () => {
		saveSignup(
			'ada@example.org',
			{
				recordId: 'rec1',
				recordToken: 'tok1',
				keepInformed: false,
				intent: 'None',
				chapterAnswer: null
			},
			0
		)
		saveSignup(
			'ada@example.org',
			{
				recordId: 'rec2',
				recordToken: 'tok2',
				keepInformed: true,
				intent: 'Act now',
				chapterAnswer: { answer: 'yes', country: 'Germany' }
			},
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
		saveSignupFromPost(formData, 'rec1', 'tok1', null)
		expect(loadSignup('ada@example.org')).toEqual({
			recordId: 'rec1',
			recordToken: 'tok1',
			keepInformed: true,
			intent: 'Lead',
			chapterAnswer: null
		})
		formData.set('intent', 'Overlord')
		formData.delete('keep_informed')
		saveSignupFromPost(formData, 'rec1', 'tok1', null)
		expect(loadSignup('ada@example.org')).toEqual({
			recordId: 'rec1',
			recordToken: 'tok1',
			keepInformed: false,
			intent: 'None',
			chapterAnswer: null
		})
	})

	it('keeps the answer the row held when a post carries none', () => {
		const formData = new FormData()
		formData.set('email', 'ada@example.org')
		formData.set('intent', 'None')
		formData.set('country', 'Germany')
		formData.set('chapter_share', 'no')
		const held = saveSignupFromPost(formData, 'rec1', 'tok1', null)
		expect(held).toEqual({ answer: 'no', country: 'Germany' })
		expect(loadSignup('ada@example.org')?.chapterAnswer).toEqual(held)

		// The /subscribe "do more" step, which does not ask again.
		formData.delete('chapter_share')
		formData.set('intent', 'Volunteer')
		expect(saveSignupFromPost(formData, 'rec1', 'tok2', held)).toEqual(held)
		expect(loadSignup('ada@example.org')?.chapterAnswer).toEqual(held)
	})

	it('returns the answer a post wrote, so a picked-up row is asked again for its old country', () => {
		const formData = new FormData()
		formData.set('email', 'ada@example.org')
		formData.set('intent', 'Volunteer')
		formData.set('country', 'France')
		formData.set('chapter_share', 'yes')
		// Picked up holding a No for Germany, then answered Yes for France.
		const pickedUp = { answer: 'no' as const, country: 'Germany' }
		const held = saveSignupFromPost(formData, 'rec1', 'tok1', pickedUp)
		expect(held).toEqual({ answer: 'yes', country: 'France' })
		expect(loadSignup('ada@example.org')?.chapterAnswer).toEqual(held)
		// Back to step 1 and Germany again: the row no longer holds Germany's answer.
		expect(heldChapterAnswer(held, 'ada@example.org', 'ada@example.org', 'Germany')).toBeNull()
		expect(heldChapterAnswer(held, 'ada@example.org', 'ada@example.org', 'France')).toBe('yes')
	})

	it('counts a saved answer only for the country it was given for', () => {
		const formData = new FormData()
		formData.set('email', 'ada@example.org')
		formData.set('intent', 'None')
		formData.set('country', 'Germany')
		formData.set('chapter_share', 'yes')
		saveSignupFromPost(formData, 'rec1', 'tok1', null)
		const saved = loadSignup('ada@example.org')?.chapterAnswer ?? null
		expect(chapterAnswerFor(saved, ' germany ')).toBe('yes')
		// Coming back and picking France asks again.
		expect(chapterAnswerFor(saved, 'France')).toBeNull()
		expect(chapterAnswerFor(null, 'Germany')).toBeNull()
	})

	it("counts a picked-up row's answer only while the email is the one it was picked up for", () => {
		const held = { answer: 'yes' as const, country: 'Germany' }
		expect(heldChapterAnswer(held, 'Ada@example.org', ' ada@example.org', 'Germany')).toBe('yes')
		// Back to step 1 and another email: that email gets a row of its own, so it is asked.
		expect(heldChapterAnswer(held, 'ada@example.org', 'grace@example.org', 'Germany')).toBeNull()
		// Nothing picked up (a row created in this mount, or none).
		expect(heldChapterAnswer(held, null, 'ada@example.org', 'Germany')).toBeNull()
		// Same email, another country: asked again.
		expect(heldChapterAnswer(held, 'ada@example.org', 'ada@example.org', 'France')).toBeNull()
	})

	it('drops the answer once a post lands in the United States', () => {
		const formData = new FormData()
		formData.set('email', 'ada@example.org')
		formData.set('intent', 'None')
		formData.set('country', 'United States')
		const held = { answer: 'yes' as const, country: 'Germany' }
		expect(saveSignupFromPost(formData, 'rec1', 'tok2', held)).toBeNull()
		expect(loadSignup('ada@example.org')?.chapterAnswer).toBeNull()
	})

	it('ignores an answer saved without its country', () => {
		sessionStorage.setItem(
			'pauseai-onboarding-signup',
			JSON.stringify({
				recordId: 'rec1',
				email: 'ada@example.org',
				chapterAnswer: 'yes',
				savedAt: 0
			})
		)
		expect(loadSignup('ada@example.org', 0)?.chapterAnswer).toBeNull()
	})

	it('loads an entry saved before the chapter question with no answer', () => {
		sessionStorage.setItem(
			'pauseai-onboarding-signup',
			JSON.stringify({ recordId: 'rec1', email: 'ada@example.org', keepInformed: true, savedAt: 0 })
		)
		expect(loadSignup('ada@example.org', 0)?.chapterAnswer).toBeNull()
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
				intent: 'Act now',
				chapterAnswer: null
			})
		).not.toThrow()
		expect(loadSignup('ada@example.org')).toBeNull()
	})
})
