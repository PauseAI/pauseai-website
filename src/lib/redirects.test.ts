import { isRedirect } from '@sveltejs/kit'
import { describe, expect, it } from 'vitest'
import { handleRedirects } from './redirects'

/** Where `path` redirects to, and how, or null when it doesn't. */
function redirectOf(path: string, search = ''): { status: number; location: string } | null {
	try {
		handleRedirects(path, () => search)
		return null
	} catch (e) {
		if (!isRedirect(e)) throw e
		return { status: e.status, location: e.location }
	}
}

describe('handleRedirects', () => {
	it('redirects single pages permanently', () => {
		expect(redirectOf('/selfie')).toEqual({ status: 301, location: '/sayno' })
	})

	it('moves the collateral maker to the materials maker, keeping subpaths and the query string', () => {
		expect(redirectOf('/tools/collateral')).toEqual({ status: 301, location: '/tools/materials' })
		expect(redirectOf('/tools/collateral/', '?utm_source=qr')).toEqual({
			status: 301,
			location: '/tools/materials/?utm_source=qr'
		})
		expect(redirectOf('/tools/collateral/anything/else', '?a=1&b=2')).toEqual({
			status: 301,
			location: '/tools/materials/anything/else?a=1&b=2'
		})
	})

	it("doesn't read the query string unless a section redirect matches, as prerendered pages can't", () => {
		const search = () => {
			throw new Error('read the query string')
		}
		expect(() => handleRedirects('/tools/materials', search)).not.toThrow()
		expect(() => handleRedirects('/selfie', search)).toThrow(
			expect.objectContaining({ status: 301 })
		)
	})

	it('leaves other paths alone, including ones that only start the same way', () => {
		expect(redirectOf('/tools/materials')).toBeNull()
		expect(redirectOf('/tools/collateral-old')).toBeNull()
		expect(redirectOf('/tools')).toBeNull()
	})
})
