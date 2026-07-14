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

| Param       | Effect                                                                                                                                                                                             |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `country`   | Prefills country of residence                                                                                                                                                                      |
| `city`      | Prefills city / town of residence                                                                                                                                                                  |
| `languages` | Prefills the volunteer form's language selector. Comma-separated, matched against the stored language values in `src/lib/components/onboarding/options.ts` (unmatched values are silently ignored) |
| `bg`        | Sets the embed's background color, so it blends into the host page. Accepts a hex value (`bg=fff` or `bg=%23fff`) or a CSS color name (`bg=white`). Anything else is ignored                       |

Example — a French-speaking regional chapter embed:

```html
<iframe
	src="https://pauseai.info/embed/onboarding-form?country=France&city=Paris&languages=French,English&bg=fff"
></iframe>
```

### Why only these params

Country/city/languages are things a chapter can reasonably know in advance about its audience — who's filling the form out, they can't. Personal fields (name, email, phone, intent, discovery source, etc.) are intentionally **not** prefillable via URL:

- Consent checkboxes (GDPR, volunteer agreement, code of conduct, newsletter/keep-informed opt-ins) must be actively given by the visitor — prefilling them via a shareable URL would be a dark pattern.
- Contact details (name, email, phone, Discord username) have no legitimate source when the same embed link is shared broadly to an unknown audience.

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
