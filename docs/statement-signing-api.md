# Statement signing API

For chapter sites that want their own form for the [PauseAI Statement](https://pauseai.info/statement), or want to show its signatures. All sites share one list of signatures, and this API is the way in.

There are two public endpoints:

- [`POST /api/statement/sign`](#sign-post-httpspauseaiinfoapistatementsign) adds a signature. You need no API keys, but every signature needs a [Turnstile](https://developers.cloudflare.com/turnstile/) token from the person's browser, and your site must be set up for that first.
- [`GET /api/signatories`](#list-get-httpspauseaiinfoapisignatories) lists the signatures. It needs no setup.

To add a signing form:

1. [Get your site set up](#before-you-start).
2. [Build the form](#build-the-form), with the Turnstile widget.
3. [Send the signature](#sign-post-httpspauseaiinfoapistatementsign), and [handle each response](#responses).
4. [Test it](#test-your-form).

Or skip all of that and [embed our form](#or-embed-our-form).

## Or embed our form

`https://pauseai.info/embed/statement-form` is the form from [/statement](https://pauseai.info/statement), with its thank-you message, and nothing else from the page around it. Put it in an iframe and it needs no setup: no origin to list, no Turnstile key, and signatures go to the same list. It is in English only, and always shows in the light theme. Show the statement's text on your own page, above the form.

```html
<iframe
	id="statement-form"
	src="https://pauseai.info/embed/statement-form"
	title="Sign the PauseAI Statement"
	style="width: 100%; border: none;"
></iframe>
```

The page reports its height to your page whenever it changes, for example when the thank-you replaces the form. Resize the iframe to it with the listener in [Resizing the iframe](./ONBOARDING_EMBED.md#resizing-the-iframe), calling `resizePauseAIEmbed(document.getElementById('statement-form'))`.

## Before you start

Ask in the PauseAI Discord for your site to be added, or send a pull request. Two things have to be set up for each hostname your form runs on, and PauseAI has to do the first:

1. **Cloudflare:** your hostname is added to PauseAI's Turnstile widget, so it can issue tokens there.
2. **This repo:** your exact origin is added to `CHAPTER_ORIGINS` in [`src/routes/api/statement/sign/+server.ts`](https://github.com/PauseAI/pauseai-website/blob/main/src/routes/api/statement/sign/%2Bserver.ts). `https://www.example.org` and `https://example.org` count as different origins, so list both if your site answers on both.

You then get PauseAI's Turnstile site key, which is public. Use this key, not one from your own Cloudflare account, as our server can only check tokens from this widget.

Your form should tell people how their data is used, and link to your privacy policy and [ours](https://pauseai.info/privacy). Say that the country and bio are published even for an anonymous signature, as a bio can identify someone. Our form says: "Your name is hidden, but your country and anything you write below are still published, so leave out details that could identify you."

## Build the form

Your form collects the fields in the [table below](#sign-post-httpspauseaiinfoapistatementsign). Three things need care:

- **Country:** the value you send must be the English name, spelled exactly as in `COUNTRIES` in [`options.ts`](https://github.com/PauseAI/pauseai-website/blob/main/src/lib/components/onboarding/options.ts). Show translated labels if you like, but keep those names as the values, such as `<option value="Spain">España</option>`. Anything else gets a `400`.
- **Anonymous:** send `private` as a real boolean from a checkbox, even when it's `false`.
- **Honeypot:** add a text input that's hidden from people, and send its value as `honeypot`. The example below expects it to be called `website`:

  ```html
  <input
  	type="text"
  	name="website"
  	tabindex="-1"
  	autocomplete="off"
  	aria-hidden="true"
  	style="position: absolute; left: -9999px"
  />
  ```

The example also expects inputs called `name`, `email`, `country` and `bio`, and a checkbox called `private`.

Then show the Turnstile widget, and keep its token to send. Its token field is called `cf-turnstile-response` in Cloudflare's own examples, but this API reads `turnstile_token`. See [Cloudflare's guide](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/) for the options.

```html
<script>
	let turnstileToken = ''
	let turnstileWidget

	window.onTurnstileLoad = () => {
		turnstileWidget = turnstile.render('#statement-turnstile', {
			sitekey: 'THE_SITE_KEY_YOU_WERE_GIVEN',
			language: 'es',
			callback: (token) => (turnstileToken = token),
			'expired-callback': () => (turnstileToken = '')
		})
	}
</script>
<script
	src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad"
	async
	defer
></script>

<div id="statement-turnstile"></div>
```

Keep the submit button disabled until `turnstileToken` has a value.

## Sign: `POST https://pauseai.info/api/statement/sign`

Send JSON, with `Content-Type: application/json`. Send no other custom headers, as the browser's preflight check only allows that one.

| Field             | Type    | Required | Rules                                                                                                                                                                                |
| ----------------- | ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`            | string  | yes      | Full name, up to 200 characters, with no control characters, text direction overrides or links. Kept private when `private` is `true`.                                               |
| `email`           | string  | yes      | Up to 254 characters, with no control characters or `, ; < > "`. Receives the verification email and is never published.                                                             |
| `country`         | string  | yes      | Country of residence: an English name, exactly as in `COUNTRIES` (see [Build the form](#build-the-form)).                                                                            |
| `bio`             | string  | no       | Up to 2000 characters, with no control characters other than tabs and line breaks, and no text direction overrides. Published with the signature, **including on an anonymous one**. |
| `private`         | boolean | yes      | `true` lists the signature as "Anonymous". Must be a real boolean, not `"true"`.                                                                                                     |
| `turnstile_token` | string  | yes      | The token from the Turnstile widget. Single use, and valid for five minutes.                                                                                                         |
| `honeypot`        | string  | no       | Send the value of a hidden input that people leave empty. Anything in it drops the signature silently.                                                                               |

Other fields are ignored. The body can be up to 32 KB.

An optional `language` of `en` or `es`, default `en`, says which language the person's email should be in. Anything else gets a `400`. **Until signatures move to CiviCRM it's checked but has no effect**: Airtable picks the Spanish or English email from `country`. Once they move, `language` picks it. Send it from the start, and you won't need to change anything then.

Tokens are single use, so reset the widget after every attempt, whatever the answer:

```js
async function sign(form) {
	let result
	try {
		const response = await fetch('https://pauseai.info/api/statement/sign', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: form.elements.name.value,
				email: form.elements.email.value,
				country: form.elements.country.value,
				bio: form.elements.bio.value,
				private: form.elements.private.checked,
				turnstile_token: turnstileToken,
				language: 'es',
				honeypot: form.elements.website.value
			})
		})
		result = await response.json()
	} catch {
		// A network failure, or a refusal that isn't JSON (see below).
		result = { ok: false, error: 'network_error' }
	}

	turnstileToken = ''
	turnstile.reset(turnstileWidget)
	return result
}
```

### Responses

The answers below are JSON with an `ok` boolean. The one exception is under the table.

| Status | Body                                                   | Meaning                                                                                                                                                |
| ------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 202    | `{"ok":true,"status":"pending_verification"}`          | Accepted. Ask the person to check their inbox and spam folder.                                                                                         |
| 400    | `{"ok":false,"error":"validation_failed","fields":{}}` | `fields` maps a field name to `required`, `invalid` or `too_long`. Your Turnstile token has not been used.                                             |
| 400    | `{"ok":false,"error":"invalid_json"}`                  | The body is not a JSON object.                                                                                                                         |
| 403    | `{"ok":false,"error":"origin_not_allowed"}`            | Your site's origin is not on the allowlist.                                                                                                            |
| 403    | `{"ok":false,"error":"turnstile_failed"}`              | The token is missing, invalid, expired, already used, or from a hostname not listed. Reset the widget and let them retry.                              |
| 413    | `{"ok":false,"error":"payload_too_large"}`             | The body is over 32 KB.                                                                                                                                |
| 415    | `{"ok":false,"error":"unsupported_media_type"}`        | The `Content-Type` is not `application/json`, and is not one of the form types below.                                                                  |
| 429    | `{"ok":false,"error":"rate_limited"}`                  | Too many signatures. The `Retry-After` header gives the seconds to wait, and browsers can read it.                                                     |
| 502    | `{"ok":false,"error":"save_failed"}`                   | We could not save it. Keep what the person typed and let them retry with a new token.                                                                  |
| 503    | `{"ok":false,"error":"signing_unavailable"}`           | Signing is switched off, and nothing was saved. Keep what the person typed, and let them try later.                                                    |
| 503    | `{"ok":false,"error":"turnstile_unavailable"}`         | We could not check the token right now, and nothing was saved. Let them retry with a new token, and if it keeps happening, offer contact@pauseai.info. |

Show your own translated messages, keyed on `error` and `fields`. Responses contain no text meant for people. Don't clear the form on an error.

**A form-type `Content-Type` never gets JSON.** SvelteKit protects every route against cross-site form posts before this API runs, so `application/x-www-form-urlencoded`, `multipart/form-data` and `text/plain` from anywhere but pauseai.info get a plain text `403` saying `Cross-site POST form submissions are forbidden`, with no CORS headers. A browser reports this as a network error. Requests with no `Origin` get the same. Check that you send `application/json`, including from a browser's `fetch`, where a string body defaults to `text/plain`.

A 202 does not say whether the address has signed before, and a filled honeypot gets a 202 as well. Responses never contain the submitted values.

### After a 202

The signature is not public yet. We email the address a verification link. The page it opens asks them to click to confirm, because mail scanners open links on their own. The signature is listed once they have, and the site has next been deployed.

**The confirm page is in English, and on pauseai.info.** The email's language [depends on `country` until signatures move to CiviCRM, and on `language` after](#sign-post-httpspauseaiinfoapistatementsign). Tell people to expect that in your thank-you message, and to check their spam folder.

### Repeat signatures

If an address has already signed in the last 30 days, verified or not, we save nothing and send no email, and the answer is the same 202. A person who lost the first email can't get another by signing again until then. Older than that, signing again saves a new signature and sends a new email, and someone signing again under the same name is still listed once.

**Signing again doesn't change anything.** Within those 30 days, a new name, bio or request to be anonymous is dropped too, and the answer is still the same 202. Tell everyone in your thank-you message, not only people who you think have signed, to email contact@pauseai.info if they need to change something.

### Calling from a server

You still need a token, issued by the Turnstile widget in the person's browser on a listed hostname, for every signature. Pass it on as `turnstile_token`. A request with no `Origin` header skips only the browser origin check, and cannot get a signature in without a valid token. Rate limits go by the address of whatever calls this API, so a server sending on behalf of many people will hit them sooner.

### Rate limits are not a guarantee

Limits are counted per address, or per IPv6 /64, on each short-lived server instance. A sender reaching several instances gets each one's allowance, so treat them as slowing a sender down, not as a hard limit. Only signatures we accepted count against an address, so mistakes and failed attempts don't use it up, and neither limit counts traffic without a valid token. A hard limit would have to be set on the hosting platform.

## Check whether signing is on: `GET https://pauseai.info/api/statement/sign`

Answers `{"mode":"live"}`, `{"mode":"dry_run"}` or `{"mode":"off"}`. Your site can call this when the form loads, and show a message instead of the form if it isn't `live`. The server refuses signatures when it's off regardless. Pages on a listed origin can read it from the browser.

## Test your form

There is no test mode for chapter sites at the moment. Tokens can only be issued on listed hostnames, so your form cannot run end to end on `localhost` or a staging address, and calls from those origins get `origin_not_allowed`.

**Check your payload safely, from a terminal.** Validation runs before the token check, so this saves nothing and sends no email:

```bash
curl -i https://pauseai.info/api/statement/sign \
	-H 'Content-Type: application/json' \
	-d '{"name":"Ada Lovelace","email":"ada@example.org","country":"Spain","private":false}'
```

| You get                     | It means                                                 |
| --------------------------- | -------------------------------------------------------- |
| `403` `turnstile_failed`    | The fields are all valid, and only the token is missing. |
| `400` `validation_failed`   | `fields` says which ones to fix.                         |
| `503` `signing_unavailable` | Signing is switched off at the moment.                   |

**Then test on your live hostname**, with your own address. This writes a real signature, so:

- Use an address you can read, and confirm the email arrives.
- Use a new address each time, as a repeat within 30 days saves nothing and sends no email.
- Ask in the PauseAI Discord for your test signatures to be deleted, especially if you confirmed them.

**Running this repo yourself?** On `localhost`, `127.0.0.1` and `*.netlify.app`, unless `STATEMENT_SIGNING_LIVE` is `true`, this is a dry run. Signatures are validated, but nothing is saved, no email is sent, no token is needed, and a 202 carries `"dry_run": true`. The `/statement` form says so on the page.

## List: `GET https://pauseai.info/api/signatories`

Returns the verified signatures, oldest first. Any site can read it, from a browser or a server, with no setup.

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
- `country` is the English name. Translate it for display if you need to.
- `totalCount` is the number to show as your signature count. An address is listed and counted once, however many verified rows it has.
- This file is generated when pauseai.info is deployed, so a new signature appears after the next deploy. It won't appear right after someone signs on your form, so don't promise that it will.
- A `totalCount` of 0 means the list was unavailable at that deploy. Hide the list rather than showing its placeholder rows.
- It takes no parameters and has no pages. To show part of it, such as one country or the newest first, filter or reverse it yourself.
- **It's large:** about 900 KB, or 300 KB compressed, in November 2026. Where you can, fetch it when your site builds or from your server and keep the result, rather than in every visitor's browser.

```js
const { signatories, totalCount } = await (
	await fetch('https://pauseai.info/api/signatories')
).json()
const fromSpain = signatories.filter(({ country }) => country === 'Spain')
const newestFirst = [...signatories].reverse()
```

The response may be served as `text/plain`, so parse it with `response.json()` rather than relying on its content type.
