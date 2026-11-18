import { describe, expect, it } from 'vitest'
import { LIBRARY_PHOTOS } from './photos'

describe('LIBRARY_PHOTOS', () => {
	it('has unique ids', () => {
		const ids = LIBRARY_PHOTOS.map((p) => p.id)
		expect(new Set(ids).size).toBe(ids.length)
	})

	it.each(LIBRARY_PHOTOS)('$id has a photo and a small version', (photo) => {
		expect(photo.src).toBeTruthy()
		expect(photo.thumb).toBeTruthy()
		expect(photo.thumb).not.toBe(photo.src)
	})
})
