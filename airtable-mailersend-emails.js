// User Inputs (set these in Airtable's script configuration)
let {
	to_email,
	first_name,
	reply_to_email,
	languages,
	country,
	onboarding_email,
	airtable_id,
	intent,
	// Optional: override which render endpoint to call. Leave unmapped to use the
	// production default below.
	render_endpoint_url
} = input.config()
const apiKey = input.secret('MailerSend API key')
// New: shared secret for src/routes/api/onboarding-email/+server.ts (repo). Sent as
// "Authorization: Bearer <secret>". If this secret isn't configured yet, the render
// attempt below fails closed (401) and falls through to the template_id path.
const renderSecret = input.secret('Onboarding email render secret')

// A triggering record always has an ID, so this is empty only when the input variable is
// unmapped. Without the guard every email carries verificationKey=undefined and verification
// fails for the recipient with nothing failing here.
if (!airtable_id) {
	throw new Error('airtable_id is missing - refusing to send a broken verification link')
}

let verification_link = `https://pauseai.info/verify?table=join&verificationKey=${airtable_id}`

// ---------------------------------------------------------------------------------
// New first attempt: ask the repo-owned render endpoint for {subject, html, text}
// and send that directly, instead of a MailerSend template_id. Render-only endpoint
// (never sends mail itself, never touches the MailerSend API key) - see
// src/lib/server/onboardingEmail/ and src/routes/api/onboarding-email/+server.ts.
// Any failure (network error, timeout, non-OK response, or a response missing any of
// subject/html/text) falls through to the existing template_id logic below,
// unchanged. This keeps the blast radius of the new endpoint at zero: worst case is
// today's behavior.
// ---------------------------------------------------------------------------------

const RENDER_ENDPOINT_URL = render_endpoint_url || 'https://pauseai.info/api/onboarding-email'
const RENDER_TIMEOUT_MS = 8000

function withTimeout(promise, ms) {
	return Promise.race([
		promise,
		new Promise((_resolve, reject) =>
			setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms)
		)
	])
}

async function tryRenderEndpoint() {
	let response
	try {
		response = await withTimeout(
			fetch(RENDER_ENDPOINT_URL, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${renderSecret}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ first_name, country, intent, languages, airtable_id })
			}),
			RENDER_TIMEOUT_MS
		)
	} catch (error) {
		console.log(
			`Render endpoint request failed (${error.message}) - falling back to template_id send`
		)
		return null
	}

	if (!response.ok) {
		console.log(`Render endpoint returned ${response.status} - falling back to template_id send`)
		return null
	}

	let data
	try {
		data = await response.json()
	} catch (error) {
		console.log(
			`Render endpoint response wasn't valid JSON (${error.message}) - falling back to template_id send`
		)
		return null
	}

	if (!data || !data.subject || !data.html || !data.text) {
		console.log(
			'Render endpoint response missing subject/html/text - falling back to template_id send'
		)
		return null
	}

	return data
}

const rendered = await tryRenderEndpoint()

if (rendered) {
	// Sender is a fixed rule, not chapter data: global default info@pauseai.info; UK
	// standardizes on hello@pauseai.uk. Never pull an arbitrary "from" address out of
	// Airtable - the sending domain must be verified in MailerSend.
	const isUK = Boolean(country && country.trim().includes('United Kingdom'))
	const from = isUK
		? { email: 'hello@pauseai.uk', name: 'PauseAI UK' }
		: { email: 'info@pauseai.info', name: 'PauseAI' }

	// CC/reply-to logic is unchanged from the template_id path below.
	let response = await fetch('https://api.mailersend.com/v1/email', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			from,
			reply_to: {
				email: reply_to_email
			},
			to: [{ email: to_email }],
			cc: [{ email: onboarding_email }],
			subject: rendered.subject,
			html: rendered.html,
			text: rendered.text
		})
	})

	if (!response.ok) throw new Error(`Failed: ${await response.text()}`)
	console.log(
		`✅ Email sent via render endpoint (rendered subject: "${rendered.subject}", sender: ${from.email})`
	)
} else {
	// -------------------------------------------------------------------------------
	// Fallback path: the original template_id-based logic, unchanged.
	// -------------------------------------------------------------------------------

	// Define Template IDs
	const DEFAULT_TEMPLATE = '3z0vkloo5v1l7qrx'
	const SPANISH_TEMPLATE = 'o65qngkj1mjlwr12'
	const UK_TEMPLATE = 'jy7zpl97rdrg5vx6'
	const CANADA_EN_TEMPLATE = 'x2p0347j3r94zdrn'
	const CANADA_FR_TEMPLATE = 'z86org8zmvkgew13'
	// For people who did not sign up to volunteer (Intent = Act now / Keep informed).
	const NOT_VOLUNTEERING_TEMPLATE = 'z86org8mdrelew13'
	// UK-specific non-volunteer template (PauseAI UK, sender hello@pauseai.uk).
	const UK_NON_VOLUNTEERING_TEMPLATE = 'zr6ke4nyyomgon12'

	// `Languages` is a multipleSelects field, so its value is an ARRAY (e.g. ["English","Español"]),
	// and it is only ever written by the step-3 volunteer form. That form runs after this automation's
	// trigger (record creation), so `languages` is empty on every send and the language branches below
	// never fire: Spanish reaches its template via `country` alone, and CANADA_FR is unreachable.
	const langList = Array.isArray(languages) ? languages : languages ? [String(languages)] : []
	const langLower = langList.map((l) => String(l).toLowerCase())

	// Initial Logic: Default to English, switch if any selected language is Spanish
	let template_id = DEFAULT_TEMPLATE

	if (langLower.some((l) => l.startsWith('español') || l.startsWith('spanish'))) {
		template_id = SPANISH_TEMPLATE
	}

	// List of Spanish-speaking countries
	const spanishCountries = new Set([
		'Argentina',
		'Bolivia',
		'Chile',
		'Colombia',
		'Costa Rica',
		'Cuba',
		'Dominican Republic',
		'Ecuador',
		'El Salvador',
		'Equatorial Guinea',
		'Guatemala',
		'Honduras',
		'Mexico',
		'Nicaragua',
		'Panama',
		'Paraguay',
		'Peru',
		'Spain',
		'Uruguay',
		'Venezuela'
	])

	if (country) {
		const cleanCountry = country.trim()

		if (spanishCountries.has(cleanCountry)) {
			template_id = SPANISH_TEMPLATE
		}

		if (cleanCountry.includes('United Kingdom')) {
			template_id = UK_TEMPLATE
		}

		// Canada Logic: Default to English unless French is explicitly selected
		if (cleanCountry.includes('Canada')) {
			const isFrench = langLower.some((l) => l.includes('french') || l.includes('français'))
			template_id = isFrench ? CANADA_FR_TEMPLATE : CANADA_EN_TEMPLATE
		}
	}

	// Only `Volunteer` and `Lead` get the volunteer-framed geography templates. Everything else
	// (`Act now`, `Keep informed`, an empty Intent, an unrecognised value) gets the non-volunteer
	// template: it asserts nothing about why the reader signed up, so it is true for anyone, while
	// the volunteer templates tell the reader they joined a volunteer network, which is false for the
	// ~47% who did not. Intent therefore beats geography, and every uncertain case resolves to the
	// email that cannot be wrong.
	// Cost: if the `intent` mapping breaks, every record lands on the Global EN non-volunteer
	// template and volunteers lose geography-specific content (the UK call invite, the ES template).
	const KNOWN_INTENTS = ['Act now', 'Keep informed', 'Volunteer', 'Lead']
	const cleanIntent = String(intent || '').trim()

	// `intent` is empty when the input variable is unmapped, and also when the record itself has no
	// Intent (the form always sets one; a hand-made Airtable record does not). The two are
	// indistinguishable here. KNOWN_INTENTS are exact labels of an Airtable single-select option, so
	// renaming one stops the match without any error. These logs are the only signal for either.
	if (!cleanIntent) {
		console.log(
			`WARNING: Intent is empty - check the input variable mapping in the script config panel`
		)
	} else if (!KNOWN_INTENTS.includes(cleanIntent)) {
		console.log(
			`WARNING: unrecognised Intent "${cleanIntent}" - routing to the non-volunteer template`
		)
	}

	if (cleanIntent !== 'Volunteer' && cleanIntent !== 'Lead') {
		template_id = NOT_VOLUNTEERING_TEMPLATE
		if (country && country.trim().includes('United Kingdom')) {
			template_id = UK_NON_VOLUNTEERING_TEMPLATE
		}
	}

	console.log(
		`intent="${cleanIntent}" country="${country}" languages=${JSON.stringify(langList)} -> template ${template_id}`
	)

	// Send Email using Template
	let response = await fetch('https://api.mailersend.com/v1/email', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			reply_to: {
				email: reply_to_email
			},
			to: [{ email: to_email }],
			cc: [{ email: onboarding_email }],
			template_id: template_id,
			personalization: [
				{
					email: to_email,
					data: {
						first_name: first_name,
						verification_link: verification_link
					}
				}
			]
		})
	})

	// Error Handling
	if (!response.ok) throw new Error(`Failed: ${await response.text()}`)
	console.log(`✅ Email sent using template: ${template_id}`)
}
