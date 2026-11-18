import { describe, expect, it } from 'vitest'
import { qrTarget } from './qr'
import { qrShape } from './qrShape'

// The QR tool caps the web address at 200 characters (QrGenerator's input)
// and relies on any such address fitting in a code with the pause symbol.
describe('QR capacity', () => {
	it('fits a 200-character web address with the pause symbol in the middle', () => {
		const url = `pauseai.uk/${'a'.repeat(189)}`
		expect(url).toHaveLength(200)
		expect(() => qrShape(qrTarget(url, true), 1000, true)).not.toThrow()
	})
})
