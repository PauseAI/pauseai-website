// PauseAI welcome + verification email: the script node of the Airtable automation
// "Welcome + verification email + flag duplicates" (wflvWtn7ca407zeeL), which triggers on
// `Onboarder email is not empty`.
//
// TODAY EVERY SEND USES THE MAILERSEND TEMPLATES. The other path, which asks a repo-owned endpoint
// to render the email and sends what comes back, is dormant until the "Onboarding email render
// secret" is configured on this node, so tryRenderEndpoint/sendComposed and their helpers have
// never run in production. The entry flow is the three lines at the very bottom of the file.
//
// MailerSend's send API has no idempotency key, so a lost or ambiguous response cannot be told
// apart from a failure, and an Airtable-level retry of the run would send again. Hence the rule
// the error handling follows: throw before MailerSend accepts, log after. The two exceptions are
// deliberate and marked where they are - a send MailerSend accepted but suppressed or paused throws
// anyway, because a signup who cannot verify is worse than a duplicate CC.
//
// Nothing here can bound or cancel a request: the sandbox has no setTimeout and no AbortController.

// `input.config()` may only be called once per run; a second call throws and nothing is sent.
// Everything below reads CONFIG.
const CONFIG = input.config()

// MAP ALL OF THESE in the script config panel. Unmapped variables arrive as `undefined` with no
// error and are indistinguishable from a genuinely empty field, so a missing one is silent.
//
//   to_email, first_name, reply_to_email, onboarding_email  - addressing, used below
//   airtable_id                                             - builds the verification link
//   country, intent, languages                              - routing on the fallback path
//   city                  - not used yet. Chapter matching is described as by country/city, and
//                           the chapters that are not national (Montreal, London within the UK)
//                           would need it
//   gdpr_chapter_share    - whether their details reach a chapter, so whether the email may say
//                           a chapter will be in touch
//   email_subscription    - the bell opt-in. NOT a gate on chapter contact (a volunteer who skips
//                           it is still reachable about their volunteering); it governs what the
//                           email may promise to send
//   signup_source         - /join versus /subscribe, which produce the same Intent but not the
//                           same consent story
//   render_endpoint_url   - optional, points a test run at a deploy preview. UNMAP IT AFTERWARDS:
//                           while it is set, the shared secret and every signup's details go to
//                           unmerged code from a public repo, so anyone able to OPEN a pull
//                           request, not merely merge one, can see them
//
// Only the ones this script itself reads are destructured. The rest are forwarded to the endpoint
// untouched by renderRequestBody(), which is why mapping a new one never needs an edit here.
const {
	to_email: rawToEmail,
	first_name,
	reply_to_email: rawReplyToEmail,
	languages,
	country,
	onboarding_email: rawOnboardingEmail,
	airtable_id,
	intent,
	render_endpoint_url
} = CONFIG

function validAddress(a) {
	return (
		a !== null &&
		typeof a === 'object' &&
		typeof a.email === 'string' &&
		/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(a.email.trim()) &&
		(a.name === undefined || typeof a.name === 'string')
	)
}

// One malformed address rejects the WHOLE MailerSend request with a 422, so an onboarder's typo
// would strand a signup whose own address is fine. Anything that is not a well-formed plain string
// is therefore dropped rather than forwarded: a lookup or rollup mapped here arrives as an ARRAY,
// which String() would join into "a@x,b@y", and a whitespace-only value is truthy. An OPTIONAL
// address that is dropped is simply omitted from the send; a missing `to_email` throws below.
function cleanedEmail(value) {
	const trimmed = typeof value === 'string' ? value.trim() : ''
	return validAddress({ email: trimmed }) ? trimmed : ''
}
const to_email = cleanedEmail(rawToEmail)
const reply_to_email = cleanedEmail(rawReplyToEmail)
// MailerSend rejects an address that appears in both `to` and `cc`, and the onboarder is the signup
// themselves whenever a chapter lead signs up through the form.
const onboardingCandidate = cleanedEmail(rawOnboardingEmail)
const onboarding_email =
	onboardingCandidate.toLowerCase() === to_email.toLowerCase() ? '' : onboardingCandidate

// Dropping one silently would make an onboarder stop being CC'd with nothing to show why.
if (rawReplyToEmail && !reply_to_email) {
	console.log(`WARNING: reply_to_email is not a usable address - omitting it from the send`)
}
if (rawOnboardingEmail && !onboardingCandidate) {
	console.log(`WARNING: onboarding_email is not a usable address - omitting the CC`)
}

// An unmapped input is silent, so record what arrived. This line is the only signal in the run
// history that a mapping is missing or misnamed.
console.log(`input keys: ${Object.keys(CONFIG).sort().join(', ')}`)

// After the log above, so a missing mapping is diagnosable from the run history rather than only
// from MailerSend's 422 text.
if (!to_email) {
	throw new Error(
		`to_email is empty or not a plain string (got ${typeof rawToEmail}) - check the input ` +
			`variable mapping in the script config panel`
	)
}

const apiKey = input.secret('MailerSend API key')

// input.secret() THROWS for a secret that is not configured rather than returning empty, so this
// must stay wrapped: simplifying it to `input.secret(...) || ''` kills every run until the endpoint
// goes live. Absent means "use the templates", which is a deliberate state, not a failure.
let renderSecret = ''
let secretProblem = ''
try {
	renderSecret = input.secret('Onboarding email render secret') || ''
} catch (e) {
	// A MISNAMED secret lands here too, and carrying the reason is how the two are told apart once
	// the endpoint is live.
	secretProblem = e && e.message ? e.message : String(e)
}

// The verification link is the point of this email, and a wrong one fails silently: the send
// succeeds and the recipient simply cannot verify. A truthiness check is not enough, since an
// array or object from a mis-mapped input would stringify into `[object Object]` and still pass.
const recordId = typeof airtable_id === 'string' ? airtable_id.trim() : ''
if (!recordId) {
	throw new Error(
		`airtable_id is missing or not a plain string (got ${typeof airtable_id}) - refusing to send ` +
			`a broken verification link`
	)
}

const verification_link = `https://pauseai.info/verify?table=join&verificationKey=${encodeURIComponent(
	recordId
)}`

const cleanIntent = String(intent || '').trim()
const cleanCountry = String(country || '').trim()

function tagValue(s) {
	return (
		String(s || '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '')
			.slice(0, 40) || 'none' // well inside MailerSend's 191, and keeps the tag list readable
	)
}

// Only the composed path is tagged. Template sends are already identifiable by template name in
// MailerSend's reporting, and request tags OVERRIDE any configured on a template, so tagging that
// path would both add nothing and risk discarding a template's own tags.
// Limits: 5 tags, 191 characters each.
function buildTags() {
	return [
		'onboarding-welcome',
		'path:composed',
		`intent:${tagValue(cleanIntent)}`,
		`country:${tagValue(cleanCountry)}`
	]
}

// Withheld from the endpoint: it renders copy and has no reason to see who the mail goes to.
// Note the consequence of a denylist rather than an allowlist: anything mapped in future is
// forwarded by default, so do not map a secret or a large long-text field as an ordinary input.
const ADDRESS_INPUTS = ['to_email', 'reply_to_email', 'onboarding_email']

function renderRequestBody() {
	const body = {}
	for (const [key, value] of Object.entries(CONFIG)) {
		if (!ADDRESS_INPUTS.includes(key)) body[key] = value
	}
	return body
}

// Unbounded: Airtable's own 30s fetch timeout is the only bound available.
async function postToMailerSend(send) {
	return fetch('https://api.mailersend.com/v1/email', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(send)
	})
}

function readBody(response) {
	return response.text().catch((e) => `(body unreadable: ${e.message})`)
}

// A 2xx does not mean the SIGNUP was queued, which is the only thing that matters here. MailerSend
// answers 202 with no `x-message-id` when every recipient was suppressed, and 202 WITH one when only
// some were, naming the suppressed addresses in a JSON body. With a CC, "only some" can mean the
// onboarder copy went and the signup's did not.
//
// So this throws in three cases, two of them AFTER MailerSend accepted, against the file-wide rule.
// That is deliberate: a re-run may send the onboarder a second copy, which is cheaper than a signup
// who can never verify and no signal that anything went wrong.
//
// Header order matters. A plain success carries the id in a header and an empty body, so reading the
// body first would make an accepted send hang whenever that read stalls - unbounded, so it runs to
// Airtable's cap, losing an id we already had and leaving a re-run free to duplicate. The body is
// read only when the content type says there is one.
async function assertQueuedForSignup(label, response) {
	const canReadHeaders = response.headers && typeof response.headers.get === 'function'
	const messageId = canReadHeaders ? response.headers.get('x-message-id') : null
	const sendPaused = canReadHeaders ? response.headers.get('x-send-paused') : null

	if (!canReadHeaders) {
		console.log(`Could not confirm the message was queued: ${label} - status ${response.status}`)
		return
	}

	if (!messageId) {
		const body = await readBody(response)
		throw new Error(
			`SUPPRESSED: MailerSend queued nothing for ${to_email}, so they will not receive their ` +
				`verification link. Check the suppression lists, clear it, and re-run. ${label} - ` +
				`status ${response.status}, body ${body.trim().slice(0, 400)}`
		)
	}

	if (sendPaused === 'true') {
		throw new Error(
			`SEND PAUSED: MailerSend accepted ${to_email} (id ${messageId}) but sending is paused on ` +
				`the account or domain, so nothing goes out until it is resumed. ${label}`
		)
	}

	// MailerSend answers an ordinary accepted send with an EMPTY body, and only sends a JSON body
	// when it has a warning to report. Reading a body we do not need is not free here: nothing can
	// bound a stalled read, so it would run to Airtable's fetch limit on a send MailerSend has
	// already accepted, and a re-run would then duplicate it.
	const contentType = response.headers.get('content-type') || ''
	const suppressedSignup = contentType.includes('json')
		? await bodySuppresses(response, to_email)
		: false
	if (suppressedSignup) {
		throw new Error(
			`SUPPRESSED: MailerSend accepted the request (id ${messageId}) but suppressed ${to_email}, ` +
				`so they will not receive their verification link, even though the onboarder CC may ` +
				`have gone out. Clear the suppression and re-run - the onboarder may get a second ` +
				`copy, which is the accepted cost of not silently stranding a signup. ${label}`
		)
	}

	console.log(`✅ ${label} - status ${response.status}, id ${messageId}`)
}

// True only when the response body names `address` as suppressed. Any doubt (unreadable, not JSON,
// an unfamiliar shape) returns false: this decides whether to FAIL an otherwise accepted send, so
// it must not fire on a guess. A false negative is the pre-existing behaviour; a false positive
// would fail a send that actually went out.
async function bodySuppresses(response, address) {
	let body
	try {
		body = await response.text()
	} catch (e) {
		console.log(`Could not read the response body to check suppression: ${e.message}`)
		return false
	}
	if (!body || !body.trim()) return false
	console.log(`response body: ${body.trim().slice(0, 400)}`)

	let parsed
	try {
		parsed = JSON.parse(body)
	} catch (e) {
		return false
	}
	const warnings = parsed && Array.isArray(parsed.warnings) ? parsed.warnings : []
	const target = address.toLowerCase()
	for (const warning of warnings) {
		// Only the suppression warning names addresses that were NOT sent to. Another warning type
		// that happened to carry `recipients` would otherwise fail a send that did go out.
		if (!warning || warning.type !== 'SOME_SUPPRESSED') continue
		const recipients = Array.isArray(warning.recipients) ? warning.recipients : []
		for (const recipient of recipients) {
			const email = recipient && typeof recipient.email === 'string' ? recipient.email : ''
			if (email.trim().toLowerCase() === target) return true
		}
	}
	return false
}

// Render-only: it never sends mail and never sees the MailerSend key. Any failure falls through
// to the template path.

const RENDER_ENDPOINT_URL = render_endpoint_url || 'https://pauseai.info/api/onboarding-email'

// The fallback below covers every FAST failure - a non-2xx, unparseable JSON, a missing field, a
// refused connection - because each of those returns or rejects promptly and leaves the run free to
// send a template instead. What it cannot cover is a STALL: a connection the endpoint accepts and
// never answers. Nothing inside an Airtable script can abandon a request (no timers, no
// AbortController), so a stall runs to Airtable's own 30s fetch timeout, and whether that rejects
// catchably or fails the whole action is undocumented. If it fails the action, the person gets no
// email at all rather than the template one.
//
// Accepted rather than solved: a stalled Netlify function is rare, the same exposure already exists
// on the MailerSend send below, and the failure is loud - the run fails and `Sent emails` stays
// unticked, so it is visible and re-runnable. Making it robust means moving the slow call out of
// Airtable entirely (a worker that 202s immediately), which is a bigger change than this path
// warrants today.
async function tryRenderEndpoint() {
	if (!renderSecret) {
		console.log(
			`Render endpoint not configured (expected until rollout) - using templates` +
				(secretProblem ? ` [${secretProblem}]` : '')
		)
		return null
	}

	let response
	try {
		response = await fetch(RENDER_ENDPOINT_URL, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${renderSecret}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(renderRequestBody())
		})
	} catch (error) {
		console.log(`Render endpoint request failed (${error.message}) - falling back to template`)
		return null
	}

	// Permanent failures reject every future send too, and the fallback hides that, so they must
	// look different in the run history from a blip. We log rather than throw: the fallback sends
	// straight after, and an Airtable retry of a throwing script would send twice. Run history is
	// therefore the ONLY signal these produce - check it after any config change.
	const PERMANENT = [400, 401, 402, 403, 404, 405, 406, 410, 413, 415, 422]
	if (PERMANENT.includes(response.status)) {
		console.log(
			`MISCONFIGURED: render endpoint returned ${response.status}. Usually permanent, so every ` +
				`send will quietly use templates until someone fixes it. Check the shared secret, the ` +
				`endpoint URL and the request contract. (400 and 422 can instead be one bad record, ` +
				`and a 404 during a deploy is transient.)`
		)
		return null
	}

	if (!response.ok) {
		console.log(`Render endpoint returned ${response.status} (transient) - falling back`)
		return null
	}

	let data
	try {
		data = await response.json()
	} catch (error) {
		console.log(`Render endpoint response wasn't valid JSON (${error.message}) - falling back`)
		return null
	}

	if (!data) {
		console.log('Render endpoint returned no data - falling back')
		return null
	}

	// A deliberate "do not compose this one" answer. Used while only some audiences are composed;
	// the reader gets their existing template rather than a half-built email.
	if (data.skip) {
		console.log(`Render endpoint declined this record (${data.skip}) - using template`)
		return null
	}

	// Truthiness is not enough: an object, an array or a whitespace string would pass it.
	const filled = (v) => typeof v === 'string' && v.trim().length > 0
	if (!filled(data.subject) || !filled(data.html) || !filled(data.text)) {
		console.log('Render endpoint response was not renderable (subject/html/text) - falling back')
		return null
	}
	// The endpoint composes the whole email, including the verification link, so a renderer that
	// regresses can return perfectly plausible copy with the link missing or wrong. That sends and
	// logs as a success while the recipient can never verify, which is the one failure this script
	// exists to prevent - so treat it like any other unusable response and fall back to the template,
	// which builds the link here rather than trusting the endpoint for it.
	if (!data.html.includes(recordId) || !data.text.includes(recordId)) {
		console.log(
			`Render endpoint response is missing the verification link for ${recordId} - falling back`
		)
		return null
	}
	if (data.from !== undefined && !validAddress(data.from)) {
		console.log('Render endpoint returned an unusable `from` - falling back')
		return null
	}
	return data
}

// Returns true when MailerSend accepted the composed send. Returns false when it REJECTED it, so
// the caller can still send the template: a rejection means nothing was queued, so there is no
// duplicate risk. A thrown network error is different - the send may or may not have happened -
// so that is rethrown rather than retried as a template.
async function sendComposed(rendered) {
	// Sender is a fixed rule, never a value out of Airtable: the domain must be verified in
	// MailerSend or the send fails. The endpoint may override it (so sender rules stay a repo
	// decision rather than another edit to this node); these are the fallback.
	const isUK = cleanCountry.includes('United Kingdom')
	const from = rendered.from
		? { email: rendered.from.email.trim(), name: rendered.from.name }
		: {
				email: isUK ? 'hello@pauseai.uk' : 'info@pauseai.info',
				name: isUK ? 'PauseAI UK' : 'PauseAI'
			}

	// The endpoint may suppress the onboarder copy but may NEVER redirect it. Its code lives in a
	// public repo, so a merged pull request able to set `cc` could copy every signup to an
	// arbitrary address. Recipients are decided here and nowhere else.
	const send = {
		from,
		to: [{ email: to_email }],
		subject: rendered.subject,
		html: rendered.html,
		text: rendered.text,
		tags: buildTags()
	}
	// Omitted rather than sent empty: MailerSend 422s on `{email: undefined}`. `reply_to` is
	// deliberately NOT endpoint-settable: it already varies correctly per chapter from Airtable,
	// and letting the endpoint set it would hand a public repo the ability to redirect replies
	// invisibly - the same reason `headers` is excluded below.
	if (reply_to_email) send.reply_to = { email: reply_to_email }
	if (onboarding_email && rendered.suppress_cc !== true) {
		send.cc = [{ email: onboarding_email }]
	}

	// Anything else the endpoint wants to set, kept to the smallest useful set. `headers` is
	// deliberately excluded: it cannot add envelope recipients, but it can write To/Cc/Bcc and
	// Reply-To display headers, and nothing needs it yet. Extend this list rather than editing
	// anything else in this node.
	const ENDPOINT_MAY_SET = ['list_unsubscribe', 'settings']
	if (rendered.mailersend && typeof rendered.mailersend === 'object') {
		for (const key of ENDPOINT_MAY_SET) {
			if (rendered.mailersend[key] !== undefined) send[key] = rendered.mailersend[key]
		}
	}

	const response = await postToMailerSend(send)

	// Only a payload rejection is safely retryable as a template: MailerSend definitely queued
	// nothing, and the template's payload is different so it may well succeed. Everything else
	// either would fail identically on the template path (401/403/429 - same key, same account) or
	// is ambiguous about whether the mail went out (5xx, 408), and sending again could duplicate.
	const COMPOSED_RETRYABLE = [400, 422]
	if (!response.ok) {
		const body = await readBody(response)
		if (COMPOSED_RETRYABLE.includes(response.status)) {
			console.log(
				`Composed send rejected (${response.status}): ${body} - sending the template instead ` +
					`so the recipient still gets their verification link`
			)
			return false
		}
		throw new Error(`Composed send failed (${response.status}), not retrying: ${body}`)
	}

	await assertQueuedForSignup(`composed email from ${from.email}`, response)
	return true
}

async function sendViaTemplate() {
	const DEFAULT_TEMPLATE = '3z0vkloo5v1l7qrx'
	const SPANISH_TEMPLATE = 'o65qngkj1mjlwr12'
	const UK_TEMPLATE = 'jy7zpl97rdrg5vx6'
	const CANADA_EN_TEMPLATE = 'x2p0347j3r94zdrn'
	const CANADA_FR_TEMPLATE = 'z86org8zmvkgew13'
	// Irina's short confirmation copy. The default asserts nothing about why the reader signed up,
	// so it is safe for an unknown or empty Intent; the act-now one thanks them for taking action,
	// which is true only on an exact match. Rolling back means pasting the old 363-word body into
	// these two in MailerSend; the template that carried it is kept there for that purpose. Do NOT
	// go deleting "unreferenced" MailerSend templates on the strength of this: its id differs from
	// CANADA_FR_TEMPLATE above by three characters.
	const NON_VOLUNTEER_TEMPLATE = '7dnvo4dyjd345r86'
	const NON_VOLUNTEER_ACT_NOW_TEMPLATE = 'ynrw7gy8z1n42k8e'
	// UK-specific non-volunteer template (PauseAI UK, sender hello@pauseai.uk). Serves both intents:
	// its content is PauseAI UK's own local steps, which would have to be rewritten twice to split.
	const UK_NON_VOLUNTEER_TEMPLATE = 'zr6ke4nyyomgon12'

	// Only the step-3 volunteer form writes `Languages`, and whether it has run by the time this
	// automation fires is unverified - so `country` is the reliable Spanish signal and the language
	// branches may never match. Do not drop the country route in favour of the language one.
	// A multipleSelects field arrives as an array; a lookup or single-line mapping arrives
	// comma-joined, so split before matching or only a first-listed language would be found.
	const langList = Array.isArray(languages) ? languages : languages ? [String(languages)] : []
	const langLower = []
	for (const entry of langList) {
		for (const part of String(entry).split(',')) {
			const token = part.trim().toLowerCase()
			if (token) langLower.push(token)
		}
	}

	let template_id = DEFAULT_TEMPLATE

	if (langLower.some((l) => l.startsWith('español') || l.startsWith('spanish'))) {
		template_id = SPANISH_TEMPLATE
	}

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

	if (cleanCountry) {
		if (spanishCountries.has(cleanCountry)) {
			template_id = SPANISH_TEMPLATE
		}

		if (cleanCountry.includes('United Kingdom')) {
			template_id = UK_TEMPLATE
		}

		if (cleanCountry.includes('Canada')) {
			const isFrench = langLower.some((l) => l.includes('french') || l.includes('français'))
			template_id = isFrench ? CANADA_FR_TEMPLATE : CANADA_EN_TEMPLATE
		}
	}

	// Only `Volunteer` and `Lead` get the volunteer-framed geography templates, which tell the reader
	// they joined a volunteer network - false for the ~47% who did not. So intent beats geography,
	// and every uncertain case (`Keep informed`, an empty Intent, an unrecognised value) resolves to
	// NON_VOLUNTEER_TEMPLATE, the email that cannot be wrong.
	// Cost: if the `intent` mapping breaks, every record lands on that template and volunteers lose
	// geography-specific content (the UK call invite, the ES template).
	const KNOWN_INTENTS = ['Act now', 'Keep informed', 'None', 'Volunteer', 'Lead']

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
		if (cleanCountry.includes('United Kingdom')) {
			template_id = UK_NON_VOLUNTEER_TEMPLATE
		} else if (cleanIntent === 'Act now') {
			template_id = NON_VOLUNTEER_ACT_NOW_TEMPLATE
		} else {
			template_id = NON_VOLUNTEER_TEMPLATE
		}
	}

	console.log(
		`intent="${cleanIntent}" country="${cleanCountry}" languages=${JSON.stringify(langList)} -> template ${template_id}`
	)

	// Omitted rather than sent empty: `{email: undefined}` is a 422 for the whole request.
	const send = {
		to: [{ email: to_email }],
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
	}
	if (reply_to_email) send.reply_to = { email: reply_to_email }
	if (onboarding_email) send.cc = [{ email: onboarding_email }]

	const response = await postToMailerSend(send)

	if (!response.ok) {
		const body = await readBody(response)
		throw new Error(`Template send failed (${response.status}): ${body}`)
	}

	await assertQueuedForSignup(`template ${template_id}`, response)
}

const rendered = await tryRenderEndpoint()

const sent = rendered ? await sendComposed(rendered) : false

// Anything ambiguous threw before here rather than risking a second send.
if (!sent) {
	await sendViaTemplate()
}
