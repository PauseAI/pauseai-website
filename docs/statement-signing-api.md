# Statement signing API

For chapter sites that want their own form for the [PauseAI Statement](https://pauseai.info/statement). All sites share one list of signatures, and this API is the way in. You need no API keys, but every signature needs a [Turnstile](https://developers.cloudflare.com/turnstile/) token from the person's browser, and your site must be set up for that first.

## Before you start

Ask in the PauseAI Discord for your site to be added, or send a pull request. Two things have to be set up for each hostname your form runs on, and PauseAI has to do the first:

1. **Cloudflare:** your hostname is added to PauseAI's Turnstile widget, so it can issue tokens there.
2. **This repo:** your exact origin is added to `CHAPTER_ORIGINS` in `src/routes/api/statement/sign/+server.ts`. `https://www.example.org` and `https://example.org` count as different origins, so list both if your site answers on both.

You then get PauseAI's Turnstile site key, which is public, and show its widget on your form. See [Cloudflare's guide](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/). Tokens can only be issued on listed hostnames, so your form cannot work on `localhost` or a staging address. There is no test mode for chapter sites at the moment.

## Sign: `POST https://pauseai.info/api/statement/sign`

Send JSON, with `Content-Type: application/json`.

| Field             | Type    | Required | Rules                                                                                                                                                                                |
| ----------------- | ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`            | string  | yes      | Full name, up to 200 characters, with no control characters, text direction overrides or links. Kept private when `private` is `true`.                                               |
| `email`           | string  | yes      | Up to 254 characters, with no control characters or `, ; < > "`. Receives the verification email and is never published.                                                             |
| `country`         | string  | yes      | Country of residence: an English name, exactly as in `COUNTRIES` in `src/lib/components/onboarding/options.ts`.                                                                      |
| `bio`             | string  | no       | Up to 2000 characters, with no control characters other than tabs and line breaks, and no text direction overrides. Published with the signature, **including on an anonymous one**. |
| `private`         | boolean | yes      | `true` lists the signature as "Anonymous". Must be a real boolean, not `"true"`.                                                                                                     |
| `turnstile_token` | string  | yes      | The token from the Turnstile widget. Single use, and valid for five minutes.                                                                                                         |
| `honeypot`        | string  | no       | Send the value of a hidden input that people leave empty. Anything in it drops the signature silently.                                                                               |

Other fields are ignored. The body can be up to 32 KB.

```js
const response = await fetch('https://pauseai.info/api/statement/sign', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({
		name: 'Ada Lovelace',
		email: 'ada@example.org',
		country: 'Spain',
		bio: 'Why this matters to me.',
		private: false,
		turnstile_token: turnstileToken,
		honeypot: form.elements.website.value
	})
})
const result = await response.json()
```

### Responses

The answers below are JSON with an `ok` boolean. The one exception is under the table.

| Status | Body                                                   | Meaning                                                                                                                   |
| ------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| 202    | `{"ok":true,"status":"pending_verification"}`          | Accepted. Ask the person to check their inbox and spam folder.                                                            |
| 400    | `{"ok":false,"error":"validation_failed","fields":{}}` | `fields` maps a field name to `required`, `invalid` or `too_long`. Your Turnstile token has not been used.                |
| 400    | `{"ok":false,"error":"invalid_json"}`                  | The body is not a JSON object.                                                                                            |
| 403    | `{"ok":false,"error":"origin_not_allowed"}`            | Your site's origin is not on the allowlist.                                                                               |
| 403    | `{"ok":false,"error":"turnstile_failed"}`              | The token is missing, invalid, expired, already used, or from a hostname not listed. Reset the widget and let them retry. |
| 413    | `{"ok":false,"error":"payload_too_large"}`             | The body is over 32 KB.                                                                                                   |
| 415    | `{"ok":false,"error":"unsupported_media_type"}`        | The `Content-Type` is not `application/json`, and is not one of the form types below.                                     |
| 429    | `{"ok":false,"error":"rate_limited"}`                  | Too many signatures. The `Retry-After` header gives the seconds to wait, and browsers can read it.                        |
| 502    | `{"ok":false,"error":"save_failed"}`                   | We could not save it. Keep what the person typed and let them retry with a new token.                                     |
| 503    | `{"ok":false,"error":"signing_unavailable"}`           | Signing is switched off, and nothing was saved. Keep what the person typed, and let them try later.                       |
| 503    | `{"ok":false,"error":"turnstile_unavailable"}`         | We could not check the token right now, and nothing was saved. Let them retry with a new token.                           |

Show your own translated messages, keyed on `error` and `fields`.

**A form-type `Content-Type` never gets JSON.** SvelteKit protects every route against cross-site form posts before this API runs, so `application/x-www-form-urlencoded`, `multipart/form-data` and `text/plain` from anywhere but pauseai.info get a plain text `403` saying `Cross-site POST form submissions are forbidden`, with no CORS headers. A browser reports this as a network error. Requests with no `Origin` get the same. Check that you send `application/json`, including from a browser's `fetch`, where a string body defaults to `text/plain`.

A 202 does not say whether the address has signed before, and a filled honeypot gets a 202 as well. Responses never contain the submitted values.

### Repeat signatures

If an address has already signed in the last 30 days, verified or not, we save nothing and send no email, and the answer is the same 202. A person who lost the first email can't get another by signing again until then. Older than that, signing again saves a new row and sends a new email, and the address is still listed only once. People who share an email address can't sign separately.

### After a 202

The signature is not public yet. We email the address a verification link. The page it opens asks them to click to confirm, because mail scanners open links on their own. The signature is listed once they have, and the site has next been deployed.

### Calling from a server

You still need a token, issued by the Turnstile widget in the person's browser on a listed hostname, for every signature. Pass it on as `turnstile_token`. A request with no `Origin` header skips only the browser origin check, and cannot get a signature in without a valid token. Rate limits go by the address of whatever calls this API, so a server sending on behalf of many people will hit them sooner.

### Rate limits are not a guarantee

Limits are counted per address, or per IPv6 /64, on each short-lived server instance. A sender reaching several instances gets each one's allowance, so treat them as slowing a sender down, not as a hard limit. Only signatures we accepted count against an address, so mistakes and failed attempts don't use it up, and neither limit counts traffic without a valid token. A hard limit would have to be set on the hosting platform.

Your form should tell people how their data is used, and link to your privacy policy and [ours](https://pauseai.info/privacy).

### Local servers and deploy previews

On `localhost`, `127.0.0.1` and `*.netlify.app`, unless `STATEMENT_SIGNING_LIVE` is `true`, this is a dry run. Signatures are validated, but nothing is saved, no email is sent, no token is needed, and a 202 carries `"dry_run": true`. The `/statement` form says so on the page. `GET /api/statement/sign` answers `{"mode":"live"}`, `{"mode":"dry_run"}` or `{"mode":"off"}`.

## List: `GET https://pauseai.info/api/signatories`

Returns the verified signatures, oldest first. Any site can read it, from a browser or a server.

```json
{
	"signatories": [
		{
			"private": false,
			"name": "Ada Lovelace",
			"country": "Spain",
			"bio": "Why this matters to me.",
			"date": "2026-11-08T12:00:00.000Z"
		}
	],
	"totalCount": 1
}
```

- `name` is `"Anonymous"` when `private` is `true`.
- `bio` can be missing. Render it and `name` as plain text, never as HTML.
- `totalCount` is the number to show as your signature count. An address is listed and counted once, however many verified rows it has.
- This file is generated when pauseai.info is deployed, so a new signature appears after the next deploy.
- A `totalCount` of 0 means the list was unavailable at that deploy. Hide the list rather than showing its placeholder rows.

```js
const { signatories, totalCount } = await (
	await fetch('https://pauseai.info/api/signatories')
).json()
```

The response may be served as `text/plain`, so parse it with `response.json()` rather than relying on its content type.
