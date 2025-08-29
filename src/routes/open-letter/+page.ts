import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch }) => {
	try {
		// Load the signatories data from our static JSON file
		const response = await fetch('/open-letter/portraits/signatories/signatories-square.json')
		const signatories = await response.json()

		// Filter only successful signatories with portraits or organizations
		const validSignatories = signatories.filter(
			(signatory: any) => signatory.status === 'success' || signatory.type === 'Organization'
		)

		return {
			signatories: validSignatories
		}
	} catch (error) {
		console.error('Failed to load signatories:', error)
		return {
			signatories: []
		}
	}
}
