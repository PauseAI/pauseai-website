# Email template routing

Script: `airtable-mailersend-emails.js` (repo root). Airtable automation → this script → MailerSend, picks a `template_id` based on `intent` / `country` / `languages`.

Each `.json` file here = raw payload from `https://app.mailersend.com/templates/<id>/` for one template constant in the script. Fetch that URL (logged in to MailerSend) and paste the response over the stub file. Edit UI: `https://app.mailersend.com/templates/<id>/edit`.

| Script constant                | File                                        | Routing condition                                                                                                |
| ------------------------------ | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `DEFAULT_TEMPLATE`             | `default-3z0vkloo5v1l7qrx.json`             | `Volunteer`/`Lead` intent, fallback when no other rule matches (non-Spanish, non-UK, non-Canada)                 |
| `SPANISH_TEMPLATE`             | `spanish-o65qngkj1mjlwr12.json`             | `Volunteer`/`Lead` intent + `country` in Spanish-speaking list (or `languages` includes Spanish — see gap below) |
| `UK_TEMPLATE`                  | `uk-jy7zpl97rdrg5vx6.json`                  | `Volunteer`/`Lead` intent + `country` includes "United Kingdom"                                                  |
| `CANADA_EN_TEMPLATE`           | `canada-en-x2p0347j3r94zdrn.json`           | `Volunteer`/`Lead` intent + `country` includes "Canada", not French                                              |
| `CANADA_FR_TEMPLATE`           | `canada-fr-z86org8zmvkgew13.json`           | Intended: as above + `languages` includes French — **currently unreachable, see gap below**                      |
| `NOT_VOLUNTEERING_TEMPLATE`    | `not-volunteering-z86org8mdrelew13.json`    | `intent` NOT `Volunteer`/`Lead` (i.e. `Act now`, `Keep informed`, empty, unrecognised), any country except UK    |
| `UK_NON_VOLUNTEERING_TEMPLATE` | `uk-non-volunteering-zr6ke4nyyomgon12.json` | `intent` NOT `Volunteer`/`Lead` + `country` includes "United Kingdom"                                            |

## Known gaps / flags for whoever scopes the migration

- **`languages` is always empty at send time.** This automation fires on record creation; `Languages` is only set later, in step 3 of the volunteer form. So: `SPANISH_TEMPLATE` is only ever reached via `country`, never via `languages`, and `CANADA_FR_TEMPLATE` is dead code — every Canadian volunteer gets the English template regardless of language. Decide whether to fix the trigger timing or drop the FR template.
- **`reply_to_email` conflict.** The script always sets `reply_to` from the Airtable `reply_to_email` input at send time — it never uses the template's own `settings.reply_to_email`. So each template's stored reply-to may not reflect what recipients actually see. Worth confirming what Airtable actually passes in per record before assuming the template's value is real.
- **Sender address isn't in the script at all** — `from` is never set on the API call, so MailerSend uses whatever `settings.sender_email`/`sender_name` each template has configured. That's the only place UK's `hello@pauseai.uk` sender identity lives — don't lose it if templates get retired.
- **Personalization payload is fixed:** script only ever sends `first_name` and `verification_link`. Any template variable outside those two won't get filled — check `variables.personalization` in each JSON for surprises.
- **UK volunteer vs UK non-volunteer** (`uk-jy7zpl97rdrg5vx6` vs `uk-non-volunteering-zr6ke4nyyomgon12`) are likely near-duplicates once both are filled in — candidate for a shared base + variant slot instead of two fully separate bodies.
- **Images**: at least one template (UK non-volunteer) has a footer image hosted on MailerSend's own CDN (`bucket.mailersendapp.com`). Those need re-hosting in the repo if templates get retired.

## What these exports are worth

They are a record of the migration, refreshed where we can.

- **Current**: `default-3z0vkloo5v1l7qrx.json` and `no-intent-7dnvo4dyjd345r86.json`, taken from the team's published previews on 2026-09-12, and `canada-en-x2p0347j3r94zdrn.json`, verified against the editor the same day.
- **Stale**: `uk-jy7zpl97rdrg5vx6.json`, from a 2026-07-15 snapshot. Real sends carry the WhatsApp invite `F0nj2RjLNeB1P1hyoDFsTz`, not the revoked `BesRzGOwnfNHuQM9fLIr0J`, and the conditional "If you opted in to our newsletter" line rather than "You're now on our mailing list". That template also runs a split test: version 1 is the long styled email, version 2 the same short note the UK non-volunteer template sends, so UK volunteers get one or the other at random.
- **Unverified**: the Spanish and UK non-volunteer exports, also from that snapshot.

**Refreshing one takes the editor or a published preview.** `https://app.mailersend.com/templates/<id>/` can serve a persistently frozen payload: the UK volunteer template's `updated_at` stayed at 2026-07-15 through an edit made on 2026-09-12. The public API is no help either, since `GET /v1/templates/<id>` returns metadata only and no HTML. In a refreshed export the preview's sample values are put back as `{{first_name}}` and `{{verification_link}}`, and its links stay wrapped in MailerSend click tracking.
