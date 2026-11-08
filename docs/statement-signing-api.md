# Statement signing API

For chapter sites that want their own form for the [PauseAI Statement](https://pauseai.info/statement). All sites share one list of signatures, and this API is the way in. You need no tokens or keys.

## Sign: `POST https://pauseai.info/api/statement/sign`

Send JSON, with `Content-Type: application/json`.

| Field      | Type    | Required | Rules                                                                                                           |
| ---------- | ------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `name`     | string  | yes      | Full name, up to 200 characters. Kept private when `private` is `true`.                                         |
| `email`    | string  | yes      | Up to 254 characters. Receives the verification email and is never published.                                   |
| `country`  | string  | yes      | Country of residence: an English name, exactly as in `COUNTRIES` in `src/lib/components/onboarding/options.ts`. |
| `bio`      | string  | no       | Up to 2000 characters. Published with the signature, **including on an anonymous one**.                         |
| `private`  | boolean | yes      | `true` lists the signature as "Anonymous". Must be a real boolean, not `"true"`.                                |
| `honeypot` | string  | no       | Send the value of a hidden input that people leave empty. Anything in it drops the signature silently.          |

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
		honeypot: form.elements.website.value
	})
})
const result = await response.json()
```

### Responses

Every response is JSON with an `ok` boolean.

| Status | Body                                                   | Meaning                                                                |
| ------ | ------------------------------------------------------ | ---------------------------------------------------------------------- |
| 202    | `{"ok":true,"status":"pending_verification"}`          | Accepted. Ask the person to check their inbox and spam folder.         |
| 400    | `{"ok":false,"error":"validation_failed","fields":{}}` | `fields` maps a field name to `required`, `invalid` or `too_long`.     |
| 400    | `{"ok":false,"error":"invalid_json"}`                  | The body is not a JSON object.                                         |
| 403    | `{"ok":false,"error":"origin_not_allowed"}`            | Your site's origin is not on the allowlist. See below.                 |
| 413    | `{"ok":false,"error":"payload_too_large"}`             | The body is over 32 KB.                                                |
| 415    | `{"ok":false,"error":"unsupported_media_type"}`        | The `Content-Type` is not `application/json`.                          |
| 429    | `{"ok":false,"error":"rate_limited"}`                  | Too many attempts. The `Retry-After` header gives the seconds to wait. |
| 502    | `{"ok":false,"error":"save_failed"}`                   | We could not save it. Keep what the person typed and let them retry.   |

Show your own translated messages, keyed on `error` and `fields`.

A 202 does not say whether the address has signed before, and a filled honeypot gets a 202 as well. Responses never contain the submitted values.

### After a 202

The signature is not public yet. We email the address a verification link, and the signature is listed once it is clicked and the site has next been deployed.

### Calling from a browser

Browsers can call this from origins on our allowlist, which starts with `https://pauseai.es`. To add your site, send a pull request adding its exact origin to `CHAPTER_ORIGINS` in `src/routes/api/statement/sign/+server.ts`, or ask in the PauseAI Discord. `https://www.example.org` and `https://example.org` count as different origins.

Requests from a server, which send no `Origin` header, need no allowlisting. Requests are rate limited by IP address, so a server sending on behalf of many people will hit the limit.

Your form should tell people how their data is used, and link to your privacy policy and [ours](https://pauseai.info/privacy).

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
- `totalCount` is the number to show as your signature count.
- This file is generated when pauseai.info is deployed, so a new signature appears after the next deploy.
- A `totalCount` of 0 means the list was unavailable at that deploy. Hide the list rather than showing its placeholder rows.

```js
const { signatories, totalCount } = await (
	await fetch('https://pauseai.info/api/signatories')
).json()
```

The response may be served as `text/plain`, so parse it with `response.json()` rather than relying on its content type.
