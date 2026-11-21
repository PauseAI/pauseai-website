import { describe, expect, it } from 'vitest'
import { sharedLocationOffsets } from './shared-location-offsets'

const edinburgh = { lat: 55.9533, lon: -3.1883 }
const oxford = { lat: 51.752, lon: -1.2577 }

describe('sharedLocationOffsets', () => {
	it('leaves markers at different locations where they are', () => {
		expect(sharedLocationOffsets([edinburgh, oxford], 10)).toEqual([0, 0])
	})

	it('puts two markers at the same location side by side, centered on it', () => {
		expect(sharedLocationOffsets([edinburgh, { ...edinburgh }], 10)).toEqual([-5, 5])
	})

	it('spreads three markers at the same location evenly around it', () => {
		expect(sharedLocationOffsets([oxford, { ...oxford }, { ...oxford }], 10)).toEqual([-10, 0, 10])
	})

	it('pairs markers at the same location wherever they sit in the list', () => {
		expect(sharedLocationOffsets([edinburgh, oxford, { ...edinburgh }], 10)).toEqual([-5, 0, 5])
	})

	it('keeps markers apart that share only a latitude', () => {
		expect(sharedLocationOffsets([edinburgh, { lat: edinburgh.lat, lon: 0 }], 10)).toEqual([0, 0])
	})
})
