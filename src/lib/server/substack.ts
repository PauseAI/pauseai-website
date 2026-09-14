/**
 * Subscribes an email to the PauseAI Substack newsletter, server-side.
 * Same endpoint the NewsletterSignup component posts to from the browser.
 * @returns true if Substack accepted the subscription
 */
export async function subscribeToSubstackNewsletter(email: string): Promise<boolean> {
	try {
		const response = await fetch('https://pauseai.substack.com/api/v1/free', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ email, source: 'pauseai_website' })
		})
		if (!response.ok) {
			const detail = await response.text().catch(() => '')
			console.error('Substack subscription failed:', response.status, detail)
		}
		return response.ok
	} catch (error) {
		console.error('Substack subscription failed:', error)
		return false
	}
}
