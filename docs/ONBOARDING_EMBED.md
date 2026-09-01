# Onboarding Form Embed

`/embed/onboarding-form` is the standalone, iframe-friendly onboarding form (replaces the old Tally volunteer form). Chapters and regional groups can embed it on their own sites, prefilled with their country/city/languages.

## Basic embed

```html
<iframe
	src="https://pauseai.info/embed/onboarding-form"
	style="width: 100%; border: none;"
></iframe>
```

The page reports its rendered height to the host via `postMessage` (`{ height: number }`) so the host can resize the iframe as the form's steps change. Listen for it:

```html
<script>
	window.addEventListener('message', (event) => {
		if (typeof event.data?.height === 'number') {
			document.getElementById('onboarding-iframe').style.height = event.data.height + 'px'
		}
	})
</script>
```

## Query params

| Param       | Effect                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `country`   | Prefills country of residence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `city`      | Prefills city / town of residence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `languages` | Prefills the volunteer form's language selector. Comma-separated, matched against the stored language values in `src/lib/components/onboarding/options.ts` (unmatched values are silently ignored)                                                                                                                                                                                                                                                                                                                                                                                      |
| `bg`        | Sets the embed's background color, so it blends into the host page. Accepts a hex value (`bg=fff` or `bg=%23fff`) or a CSS color name (`bg=white`). Anything else is ignored                                                                                                                                                                                                                                                                                                                                                                                                            |
| `source`    | Overrides the auto-detected attribution. Sanitised server-side (word chars, spaces, dashes, dots, slashes; max 80 — e.g. `pauseai.uk/join`) and written to the `Source page` field on new records. `Signup source` is unaffected — it stays the stable flow literal. Applies to new signups only, not updates. **Usually unneeded**: an embed already self-attributes from the host page URL (`document.referrer`), and first-party pages from the request `Referer`. Pass it only to force a specific label, or when the host sends `Referrer-Policy: no-referrer` (which blanks both) |

Example — a French-speaking regional chapter embed:

```html
<iframe
	src="https://pauseai.info/embed/onboarding-form?country=France&city=Paris&languages=French,English&bg=fff&source=pauseai.fr/join"
></iframe>
```

### Why only these params

Country/city/languages are things a chapter can reasonably know in advance about its audience — who's filling the form out, they can't. Personal fields (name, email, phone, intent, discovery source, etc.) are intentionally **not** prefillable via URL:

- Consent checkboxes (GDPR, volunteer agreement, code of conduct, newsletter/keep-informed opt-ins) must be actively given by the visitor — prefilling them via a shareable URL would be a dark pattern. The volunteer step's "become a paying member" opt-in is also not prefillable today, though this is less deliberate than the consent-box exclusion.
- Contact details (name, email, phone, Discord username) have no legitimate source when the same embed link is shared broadly to an unknown audience.

## Attribution: `Signup source` + `Source page`

Two fields, written once at record creation and never on an update:

- **`Signup source`** — a stable flow literal: `June 2026 onboarding flow`, or
  `June 2026 subscribe form` from `/subscribe`. Match it exactly in views and
  automations; it never carries a where-from suffix.
- **`Source page`** — the host/path the signup came from (`example.org/join`),
  or empty. Resolved server-side, first match wins:

  1. the `source` query param, if given (sanitised);
  2. else, for an iframe embed, the host page from `document.referrer`;
  3. else, for a first-party page, its own path from the request `Referer`
     (`pauseai.info/join`);
  4. else nothing — `Source page` is left unset.

**What the referrer gives you (case 2).** Under the browser default referrer
policy, a cross-origin iframe only sees the host's **origin**, so a plain
`<iframe src=".../embed/onboarding-form">` on `example.org/join` records
`Source page` = `example.org` — domain, not page. To get the full path
(`example.org/join`), the host must loosen the policy on the iframe tag:

```html
<iframe
	src="https://pauseai.info/embed/onboarding-form"
	referrerpolicy="no-referrer-when-downgrade"
></iframe>
```

(`no-referrer-when-downgrade` sends the full URL between HTTPS origins; the
query string is dropped on our side. `Referrer-Policy: no-referrer` on the host
blanks case 2 entirely — use `?source=` then.) For an exact, policy-independent
label, pass `?source=` and skip all of this.

## Mode: stub vs. live

The form's submit behavior depends on the `ONBOARDING_LIVE` env var:

- **Live** (`ONBOARDING_LIVE=true`): submissions write to Airtable and subscribe to Substack.
- **Stub** (default): submissions are captured at `/embed/onboarding-form/stub` — no Airtable write, no Substack subscription. Useful for testing an embed without creating real records.

The active mode is logged to the browser console on load.

## Related

- Flow contract (step machine, validation, live/stub mode, data written):
  [`docs/join-form-flow.md`](./join-form-flow.md)
- Form component: `src/lib/components/onboarding/OnboardingFlow.svelte`
- Embed route: `src/routes/embed/onboarding-form/+page.svelte`
- Field options (languages, countries, motivations, etc.): `src/lib/components/onboarding/options.ts`
