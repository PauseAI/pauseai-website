# Onboarding email render: v2 contract

The website renders the onboarding welcome email for a caller that sends it. This document is the contract for version 2, which the CRM calls. Version 1 (`POST /api/onboarding-email`, used by the Airtable welcome automation in `airtable-mailersend-emails.js`) is unchanged and is not described here.

The renderer only renders. It never sends mail, and it never chooses a recipient, a sender or a reply-to: the caller decides all of those. Everything the email depends on is in the request, except two things the website supplies itself: the verification link, which it builds and signs (see "Verification link"), and the routed chapter's links, which it reads from the live National Groups table as v1 does (see "Chapter links"). It reads no Members record.

## Endpoint

`POST https://pauseai.info/api/onboarding-email/v2`

v2 has its own route rather than sharing v1's, so the two validate and authenticate independently. The request body also carries `"version": 2`, and the response echoes it.

## Authentication

`Authorization: Bearer <secret>`, where the secret is the `ONBOARDING_RENDER_V2_SECRET` environment variable on the website. It is separate from v1's `ONBOARDING_EMAIL_RENDER_SECRET`, so the CRM's secret and the Airtable automation's rotate independently. While the variable is unset, every request is refused with `401`.

To rotate: set the new value on the website, deploy, then update the CRM. Requests with the old value are refused with `401` from the deploy until the CRM is updated; the CRM retries a `401` (see "Timeouts and retries"), so welcomes wait through that window and go out once both sides match.

## Request

`Content-Type: application/json`

| field           | type            | required | meaning                                                                                                                                                       |
| --------------- | --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`       | number          | yes      | Must be `2`.                                                                                                                                                  |
| `first_name`    | string          | yes      | The member's first name, 1 to 200 characters. Markdown characters (`[`, `]`, `*`) are removed before it is used.                                              |
| `languages`     | array or null   | no       | The member's recorded languages, as strings as Airtable's Members `Languages` field holds them, e.g. `["English", "Español"]`. May be empty. See "Languages". |
| `language`      | string or null  | no       | A language tag such as `en`, `es`, `es-MX` or `es_ES`. Used only when `languages` is absent. See "Languages".                                                 |
| `country`       | string or null  | no       | The member's country name, e.g. `Mexico`. Used only to pick the language. It never selects a chapter.                                                         |
| `intent`        | string or null  | no       | The member's intent as the join form records it: `Act now`, `Volunteer` or `Lead`. Anything else, or none, gets the email for a member who gave no intent.    |
| `keep_informed` | boolean or null | no       | The member's Keep me informed answer. `true` and `false` each state what we will send; null or absent keeps the hedged "if you opted in" wording.             |
| `routing`       | object          | yes      | Where the CRM routed the member. See "Routing".                                                                                                               |
| `record_id`     | string          | yes      | The member's Members row, as its full Airtable record id: `rec` followed by 14 letters or digits. See "Verification link".                                    |
| `to_email`      | string          | yes      | The address the CRM is sending this email to, at most 254 characters. Used only to sign the verification link. See "Verification link".                       |

Any other field is refused (`invalid_request`), so a new field needs a new contract version. Strings are trimmed; an empty string counts as absent for the optional fields.

### Routing

The routing is the CRM's decision and the renderer takes it as given. It never re-derives a chapter from the member's country or consent. The chapter wording and any chapter's own email follow `routing` only.

Global (no chapter, including every case where routing fell back to global onboarding):

```json
{ "kind": "global" }
```

Chapter:

```json
{
	"kind": "chapter",
	"chapter_id": 1234,
	"name": "PauseAI UK",
	"country": "United Kingdom"
}
```

| field        | type             | required | meaning                                                                                                                                                                                                                                       |
| ------------ | ---------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chapter_id` | positive integer | yes      | The chapter's id in the CRM. Not shown in the email.                                                                                                                                                                                          |
| `name`       | string           | yes      | The chapter's own name, used where the email says who will be in touch ("**Pause IA** will be in touch").                                                                                                                                     |
| `country`    | string           | yes      | The country the chapter is filed under. It selects the chapter's own email where one exists (currently United Kingdom, Canada, Sweden and Germany), names the country in the shared copy, and keys the chapter's links (see "Chapter links"). |

A `links` field on a chapter routing is accepted and ignored: the website reads the links itself.

### Chapter links

The website looks up the routed chapter's public links (Website, Discord, WhatsApp, Events, Substack, X, Instagram, TikTok, Facebook, YouTube, LinkedIn, Linktree) in the live National Groups table, the same source and the same lookup v1 uses: the active row whose `country` matches `routing.country` (exact, ignoring case and surrounding spaces), with the same link cleaning. So v1 and v2 show the same chapter block for the same chapter. The table holds one row per country and has no chapter name, so `routing.name` plays no part in the lookup. A `routing.country` of United States gets no links, as v1 shows no chapter for it. The lookup happens only when the email shows a chapter block: never for `global` routing, and not for Spanish shared copy.

If the table cannot be read, the email is rendered without chapter links and the failure is reported to the website's error tracking with the record id only; the render does not fail. A chapter with no row, or a row without a given link, likewise renders without it.

Links are shown in the shared copy's chapter block, and some chapters' own emails take a link by its label (Canada: `Website`, `Events`; Sweden: `WhatsApp`, `Events`). A missing link drops the sentence or row that would carry it; it is never an error.

What routing changes in the shared copy:

- `global`: volunteers read "Our onboarding team will be in touch." No chapter is named and no chapter links are shown.
- `chapter`: volunteers read "**<name>** will be in touch to invite you to meet your local community", followed by the links. Other members read "There's a PauseAI chapter in <country>. You're welcome to join them:" followed by the links, when there are any.

### Relation to v1

v2 is an adapter into v1's rendering: the same intent buckets, language resolver, chapter overrides, chapter block and National Groups lookup, and the same composer. Given the same member, the two render the same subject, HTML and text apart from the verification link; the website's tests check this for representative members. They differ only where intended:

- Routing: v1 picks the chapter from the member's country and the chapter-sharing answer, and also shows the chapter block to members who did not agree to sharing. v2 follows `routing`: a member routed to global onboarding sees no chapter, and a member routed to a chapter is told it will be in touch even when its National Groups row cannot be read.
- Chapter name: v1 calls a chapter "PauseAI <country>"; v2 uses `routing.name`.
- Member facts come from the request, not from a Members record.
- Language: v2 also accepts a language tag in `language` when `languages` is absent, which v1 has no equivalent of (see "Languages").
- The verification link is always signed, over `to_email`.
- v2 returns no sender and no fields for onboarders: the caller chooses every address.

### Languages

The shared copy is written in English (`en`) and Spanish (`es`).

- `languages` given (even empty): the same rule v1 applies, with the same code. Spanish when any entry starts with `Español` or `Spanish` (ignoring case; entries may also be comma-joined in one string), else Spanish when `country` is a Spanish-speaking country, else English. A member in the Netherlands whose languages include Spanish gets Spanish, as under v1. `language` is then ignored.
- `languages` absent or null, `language` given: its primary subtag decides (`es`, `es-MX` and `es_ES` all mean Spanish). Any language the shared copy is not written in gets English.
- Both absent or null: Spanish when `country` is a Spanish-speaking country, else English, as v1 decides it.
- A chapter's own email is written in its own language (Germany: German, Sweden: Swedish, United Kingdom and Canada: English) and is used whatever `languages` or `language` say.
- Spanish shared copy has no chapter block: it describes PauseAI en Español, which every Spanish-speaking country shares.

The response's `language` field says which language the email went out in.

### Verification link

The website builds the verification link and signs it; the CRM holds no verification secret. The link is

`https://pauseai.info/verify?table=join&verificationKey=<record id without rec>&token=<token>`

where the token is minted with the website's `EMAIL_VERIFICATION_SECRET` over `record_id` and the normalised `to_email`, and expires 90 days after the render. `/api/verify` accepts it only for that row while the row's `Email` still normalises to the same address. The token format, the normalisation and the verifier are described in `docs/join-form-flow.md`, "Email verification link".

`to_email` is never rendered into the email, never returned and never treated as a recipient: the caller still chooses every recipient itself. It must be the address the email is sent to, or the link will not verify.

Every v2 link is signed. While `EMAIL_VERIFICATION_SECRET` is unset on the website, every otherwise valid request is refused with `503 verification_unavailable`; v2 never returns an email with an unsigned link.

The link appears in both bodies: as the target of a link in the HTML body (HTML-escaped, so `&` appears as `&amp;`) and as plain text in the text body. Every variant the renderer can produce carries it in both; the website's test suite renders each combination of language, routing (global, a chapter without its own email, and every chapter's own email), intent and Keep me informed answer and checks for it, and checks that the token verifies for the given row and address only.

## Response

`200 OK`, `Content-Type: application/json`:

```json
{
	"version": 2,
	"subject": "Welcome to PauseAI, Alex!",
	"html": "<!doctype html>…",
	"text": "Welcome to PauseAI, Alex!\n\n…",
	"language": "en",
	"chapter_override": null
}
```

| field              | type           | meaning                                                                                      |
| ------------------ | -------------- | -------------------------------------------------------------------------------------------- |
| `version`          | number         | Always `2`.                                                                                  |
| `subject`          | string         | The subject line.                                                                            |
| `html`             | string         | A complete HTML document.                                                                    |
| `text`             | string         | The plain text alternative.                                                                  |
| `language`         | string         | The language the email is written in: `en`, `es`, `de` or `sv`.                              |
| `chapter_override` | string or null | The name of the chapter's own email in use (e.g. `PauseAI UK`), or null for the shared copy. |

There is no `from`, `to`, `cc` or `reply_to`: the caller chooses them.

## Errors

Every error is JSON with a code the caller can branch on and a message for logs:

```json
{
	"error": {
		"code": "invalid_request",
		"message": "\"routing.chapter_id\" must be a positive integer"
	}
}
```

| status    | code                       | meaning                                                                                       | retry                                              |
| --------- | -------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| 400       | `invalid_json`             | The body is not JSON.                                                                         | no: permanent                                      |
| 400       | `unsupported_version`      | `version` is missing or not `2`.                                                              | no: permanent                                      |
| 400       | `invalid_request`          | A field is missing, malformed or unknown. The message names the field.                        | no: permanent                                      |
| 401       | `unauthorized`             | The bearer secret is missing or wrong, or the website has none configured.                    | yes: expected while a secret rotation is under way |
| 405       | (no JSON body)             | A method other than `POST`.                                                                   | no: permanent                                      |
| 429       | (any body)                 | A rate limit from the hosting platform, before the handler ran. The website returns no `429`. | no: permanent, like every `4xx` other than `401`   |
| other 4xx | (any body)                 | Any other client error, from the handler or the platform.                                     | no: permanent                                      |
| 500       | `render_failed`            | Rendering failed on the website.                                                              | yes                                                |
| 503       | `verification_unavailable` | The website cannot sign verification links (`EMAIL_VERIFICATION_SECRET` unset).               | yes: succeeds once the secret is set               |
| other 5xx | (any body)                 | A platform error before the handler ran, e.g. `502` or `504` from the host.                   | yes                                                |

Messages never contain the request's values.

## Timeouts and retries

The renderer does no network I/O, so a render normally answers in well under a second; a cold start adds latency. Use a client timeout of 10 seconds.

A render has no side effects, so it is safe to retry. Each render mints a fresh token, so the link differs between attempts; send the email from the response you use.

What the CRM does with each outcome:

- Retried: a timeout, a connection error, any `5xx`, and a `401`. The welcome waits and the render is tried again later.
- Permanent: every `4xx` other than `401`, including a platform `429`. The welcome is marked failed without further attempts.
- A welcome still unrendered when the CRM's retries run out is marked failed.

There is no fallback email: a welcome is sent only from a successful render.

Before sending, the caller should check that `subject`, `html` and `text` are non-empty strings and `version` is `2`.

## Code

- Route: `src/routes/api/onboarding-email/v2/+server.ts`
- Request validation: `src/lib/server/onboardingEmail/v2Request.ts`
- Rendering: `renderOnboardingEmailV2` in `src/lib/server/onboardingEmail/index.ts`, which shares the copy, chapter overrides and layout with v1
- Chapter links: `lookupChapterForOnboardingEmail` in `src/lib/server/onboardingEmail/chapter.ts`, which v1's `getChapterForOnboardingEmail` also uses
- Language: `resolveOnboardingEmailLanguage` in `src/lib/server/onboardingEmail/language.ts`, shared with v1
- Link signing: `mintVerificationToken` and `verificationLink` in `src/lib/server/emailVerification.ts`
- Tests: `src/lib/server/onboardingEmail/v2.test.ts`, `src/routes/api/onboarding-email/v2/server.test.ts`
