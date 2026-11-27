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
			body: new URLSearchParams({ email, source: 'pauseai_website' }),
			// Bounds how long the call holds the function after the response, or
			// the response itself where nothing runs after it (the Node dev server).
			signal: AbortSignal.timeout(5000)
		})
		// The status only: the body could echo the address.
		if (!response.ok) console.error('Substack subscription failed:', response.status)
		return response.ok
	} catch (error) {
		console.error('Substack subscription failed:', (error as Error)?.name)
		return false
	}
}
