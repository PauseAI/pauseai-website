import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

/**
 * Proxies a DonorBox goal meter, applying matching donation logic.
 *
 * Matching rules:
 * - Donations are matched 1:1 up to half the goal amount
 * - e.g., for a €21,000 goal, matching caps at €10,500
 * - €5,000 raised → €10,000 effective (€5K + €5K matched)
 * - €10,500 raised → €21,000 effective (goal met!)
 * - €15,000 raised → €25,500 effective (€15K + €10.5K match cap)
 */

const DONORBOX_EMBED_URL = 'https://donorbox.org/embed'

// Parse European number format: "4.219,87 €" → 4219.87
function parseEuroAmount(text: string): number {
	const cleaned = text
		.replace(/[€$£\s]/g, '') // Remove currency symbols and spaces
		.replace(/\./g, '') // Remove thousand separators (dots in EU format)
		.replace(',', '.') // Convert decimal comma to decimal point
	return parseFloat(cleaned) || 0
}

// Format number back to European format: 4219.87 → "4.219,87"
function formatEuroAmount(amount: number): string {
	return amount.toLocaleString('de-DE', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	})
}

// Detect currency symbol from original text
function getCurrencySymbol(text: string): string {
	if (text.includes('€')) return '€'
	if (text.includes('$')) return '$'
	if (text.includes('£')) return '£'
	return '€' // default
}

export const GET: RequestHandler = async ({ params, fetch, setHeaders }) => {
	const { slug } = params

	if (!slug) {
		throw error(400, 'Campaign slug is required')
	}

	// Fetch the DonorBox goal meter embed
	// Use brand orange (#FF9416) for the meter bar
	const donorboxUrl = `${DONORBOX_EMBED_URL}/${slug}?only_donation_meter=true&donation_meter_color=%23FF9416`

	let response: Response
	try {
		response = await fetch(donorboxUrl)
	} catch (e) {
		console.error('Failed to fetch DonorBox meter:', e)
		throw error(502, 'Failed to fetch donation meter')
	}

	if (!response.ok) {
		throw error(response.status, 'DonorBox returned an error')
	}

	let html = await response.text()

	// Extract the goal meter section
	const meterMatch = html.match(/<section class="goal-meter-widget">([\s\S]*?)<\/section>/)
	if (!meterMatch) {
		throw error(502, 'Could not parse DonorBox meter')
	}

	// Extract current values from: <div class='total-raised'><b>4.219,87 €</b> / 21.000 €</div>
	const raisedMatch = html.match(/<div class='total-raised'><b>([^<]+)<\/b>\s*\/\s*([^<]+)<\/div>/)
	if (!raisedMatch) {
		throw error(502, 'Could not parse raised/goal amounts')
	}

	const raisedText = raisedMatch[1].trim()
	const goalText = raisedMatch[2].trim()

	const raised = parseEuroAmount(raisedText)
	const goal = parseEuroAmount(goalText)
	const currency = getCurrencySymbol(raisedText + goalText)

	// Calculate matching: match 1:1 up to half the goal
	const matchCap = goal / 2
	const matchedAmount = Math.min(raised, matchCap)
	const effectiveRaised = raised + matchedAmount

	// Calculate new percentage (cap at 100% for the bar width)
	const effectivePercent = Math.min(100, Math.round((effectiveRaised / goal) * 100))

	// Format the new amounts
	const effectiveRaisedFormatted = `${formatEuroAmount(effectiveRaised)} ${currency}`
	const goalFormatted = `${formatEuroAmount(goal)} ${currency}`

	// Replace the values in the HTML
	// Update the meter width and percentage text
	html = html.replace(
		/<div class='meter' style="width: \d+%; background: [^"]*">\s*\d+%\s*<\/div>/,
		`<div class='meter' style="width: ${effectivePercent}%; background: #FF9416;">\n      ${effectivePercent}%\n    </div>`
	)

	// Update the total-raised display
	html = html.replace(
		/<div class='total-raised'><b>[^<]+<\/b>\s*\/\s*[^<]+<\/div>/,
		`<div class='total-raised'><b>${effectiveRaisedFormatted}</b> / ${goalFormatted}</div>`
	)

	setHeaders({
		'Content-Type': 'text/html; charset=utf-8'
	})

	return new Response(html)
}
